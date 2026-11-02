from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from model import SoilCropModel
from pest_model import predict_pest_detailed, get_pest_classes
from pest_data import get_pests_for_crop, get_soil_fertilizer_note, get_treatment_for_pest
from auth import (hash_password, verify_password, generate_tokens,
                  decode_token, jwt_required, admin_required, optional_jwt)
from database import (
    init_db, create_user, get_user_by_email, get_user_by_email_any,
    get_user_by_id, update_last_login, update_user_profile, update_user_password,
    get_all_users, set_user_active,
    save_prediction, get_predictions, get_prediction_by_id,
    delete_prediction, get_user_stats, get_admin_dashboard_stats, log_admin_action,
    save_pest_detection, get_pest_detections, delete_pest_detection,
    create_otp, invalidate_old_otps, get_active_otp,
    increment_otp_attempts, mark_otp_used, activate_user, delete_pending_user,
)
from email_service import (
    generate_otp, send_otp_email, check_resend_rate_limit,
    OTP_EXPIRY_SEC, OTP_MAX_ATTEMPTS, DEV_MODE,
)
from PIL import Image
import os, json, re, jwt as _jwt, time, threading
from functools import wraps
from datetime import datetime, timedelta, timezone

app = Flask(__name__)

# CORS — allow all origins in dev; restrict to ALLOWED_ORIGINS in production
_raw_origins = os.environ.get('ALLOWED_ORIGINS', '')
_origins      = [o.strip() for o in _raw_origins.split(',') if o.strip()] or ['*']
CORS(app, origins=_origins, supports_credentials=True)


@app.after_request
def _add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options']         = 'DENY'
    response.headers['X-XSS-Protection']        = '1; mode=block'
    response.headers['Referrer-Policy']          = 'strict-origin-when-cross-origin'
    # Only set HSTS when served over HTTPS (Cloud Run / App Engine always uses HTTPS)
    if response.headers.get('Content-Type', '').startswith('application/'):
        response.headers['Cache-Control'] = 'no-store'
    return response

model = SoilCropModel('data_core.csv')
init_db()

# ── In-memory per-IP rate limiter ──────────────────────────────────────────────
# Generalized sliding-window limiter, applied as a decorator to individual
# routes below plus one global safety-net (see _global_rate_limit).

def _client_ip() -> str:
    return request.headers.get('X-Forwarded-For', request.remote_addr or '').split(',')[0].strip()


def rate_limit(max_calls: int, window_sec: int, message: str = 'Too many requests. Please try again later.'):
    """Decorator factory: allow at most max_calls per window_sec, keyed by client IP."""
    buckets: dict = {}
    lock = threading.Lock()

    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            ip  = _client_ip()
            now = time.time()
            with lock:
                hits = [t for t in buckets.get(ip, []) if now - t < window_sec]
                if len(hits) >= max_calls:
                    resp = jsonify({'error': message, 'code': 'RATE_LIMITED'})
                    resp.headers['Retry-After'] = str(window_sec)
                    return resp, 429
                hits.append(now)
                buckets[ip] = hits
            return f(*args, **kwargs)
        return wrapped
    return decorator


# Global safety-net: guards against a generic flood overwhelming the
# single-worker gunicorn process, independent of per-route limits below.
_GLOBAL_MAX = 200
_GLOBAL_WIN = 60  # seconds
_global_buckets: dict = {}
_global_lock = threading.Lock()
_GLOBAL_EXEMPT_PATHS = {'/health'}


@app.before_request
def _global_rate_limit():
    if request.path in _GLOBAL_EXEMPT_PATHS:
        return
    ip  = _client_ip()
    now = time.time()
    with _global_lock:
        hits = [t for t in _global_buckets.get(ip, []) if now - t < _GLOBAL_WIN]
        if len(hits) >= _GLOBAL_MAX:
            resp = jsonify({'error': 'Too many requests. Please slow down.', 'code': 'RATE_LIMITED'})
            resp.headers['Retry-After'] = str(_GLOBAL_WIN)
            return resp, 429
        hits.append(now)
        _global_buckets[ip] = hits


def ttl_cache(seconds: float):
    """Cache a zero-arg route handler's return value for `seconds`, per-process."""
    def decorator(f):
        state = {'t': 0.0, 'v': None}

        @wraps(f)
        def wrapped(*args, **kwargs):
            now = time.time()
            if now - state['t'] > seconds:
                state['v'] = f(*args, **kwargs)
                state['t'] = now
            return state['v']
        return wrapped
    return decorator

DISCLAIMER = (
    'Please consult a qualified agricultural professional or expert before '
    'applying any fertilizer, pesticide, or chemical medicine to crops.'
)


def _validate_email(email):
    return re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email) is not None


def _validate_password(pw):
    return len(pw) >= 6


# ── Root ─────────────────────────────────────────────────────────────────────

@app.route('/')
def home():
    return jsonify({'message': 'KRISHX Agricultural API v3', 'status': 'running'})


# ── Auth endpoints ────────────────────────────────────────────────────────────

@app.route('/auth/register', methods=['POST'])
@rate_limit(5, 60, 'Too many registration attempts. Please try again in a minute.')
def register():
    d         = request.json or {}
    full_name = (d.get('full_name') or '').strip()
    email     = (d.get('email') or '').strip().lower()
    phone     = (d.get('phone') or '').strip()
    password  = d.get('password') or ''

    errors = {}
    if not full_name:
        errors['full_name'] = 'Full name is required'
    if not _validate_email(email):
        errors['email'] = 'Invalid email address'
    if not _validate_password(password):
        errors['password'] = 'Password must be at least 6 characters'
    if errors:
        return jsonify({'error': 'Validation failed', 'fields': errors}), 422

    # Check for existing accounts
    existing = get_user_by_email_any(email)
    if existing:
        if existing.get('is_active') == 1:
            return jsonify({'error': 'Email already registered', 'code': 'DUPLICATE_EMAIL'}), 409
        # Pending unverified account — clean it up and allow re-registration
        delete_pending_user(email)

    if not check_resend_rate_limit(email):
        return jsonify({'error': 'Too many attempts. Please wait 30 minutes.', 'code': 'RATE_LIMITED'}), 429

    # Create inactive (pending) user
    user = create_user(full_name, email, phone, hash_password(password),
                       is_active=0, email_verified=0)
    if user is None:
        return jsonify({'error': 'Registration failed. Please try again.'}), 500

    # Generate and send OTP
    otp      = generate_otp()
    expires  = (datetime.now(timezone.utc) + timedelta(seconds=OTP_EXPIRY_SEC)).isoformat()
    invalidate_old_otps(email, 'register')
    create_otp(email, 'register', otp, expires)
    send_otp_email(email, otp, purpose='register')

    resp = {'status': 'otp_sent', 'email': email,
            'message': 'OTP sent to your email. Verify to activate your account.'}
    if DEV_MODE:
        resp['dev_note'] = 'SMTP not configured — OTP printed to Flask console'
    return jsonify(resp), 200


@app.route('/auth/login', methods=['POST'])
@rate_limit(10, 900, 'Too many login attempts. Please try again in 15 minutes.')
def login():
    d = request.json or {}
    email    = (d.get('email') or '').strip().lower()
    password = d.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = get_user_by_email(email)
    if not user or not verify_password(password, _get_password_hash(email)):
        return jsonify({'error': 'Invalid email or password', 'code': 'INVALID_CREDENTIALS'}), 401

    if not user.get('is_active', 1):
        return jsonify({'error': 'Account has been deactivated', 'code': 'ACCOUNT_INACTIVE'}), 403

    update_last_login(user['id'])
    tokens = generate_tokens(user['id'], user['email'], bool(user['is_admin']))
    return jsonify({'message': 'Login successful', 'user': user, **tokens})


@app.route('/auth/refresh', methods=['POST'])
def refresh_token():
    d = request.json or {}
    token = d.get('refresh_token') or ''
    if not token:
        return jsonify({'error': 'Refresh token required'}), 400
    try:
        payload = decode_token(token)
        if payload.get('type') != 'refresh':
            return jsonify({'error': 'Invalid token type'}), 401
        user = get_user_by_id(payload['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        tokens = generate_tokens(user['id'], user['email'], bool(user['is_admin']))
        return jsonify(tokens)
    except Exception as e:
        return jsonify({'error': 'Invalid or expired refresh token'}), 401


@app.route('/auth/verify-otp', methods=['POST'])
def verify_registration_otp():
    """Verify OTP sent during registration and activate the account."""
    d        = request.json or {}
    email    = (d.get('email') or '').strip().lower()
    otp_code = (d.get('otp_code') or '').strip()

    if not email or not otp_code:
        return jsonify({'error': 'Email and OTP code are required'}), 400

    record = get_active_otp(email, 'register')
    if not record:
        return jsonify({'error': 'OTP expired or not found. Request a new one.',
                        'code': 'OTP_EXPIRED'}), 422

    if record['attempts'] >= OTP_MAX_ATTEMPTS:
        mark_otp_used(record['id'])
        return jsonify({'error': 'Too many failed attempts. Request a new OTP.',
                        'code': 'OTP_MAX_ATTEMPTS'}), 429

    if record['otp_code'] != otp_code:
        attempts = increment_otp_attempts(record['id'])
        remaining = OTP_MAX_ATTEMPTS - attempts
        return jsonify({'error': f'Incorrect OTP. {remaining} attempt(s) remaining.',
                        'code': 'OTP_INCORRECT', 'remaining': remaining}), 422

    # OTP correct — activate account
    mark_otp_used(record['id'])
    activate_user(email)

    user   = get_user_by_email(email)
    tokens = generate_tokens(user['id'], user['email'], bool(user['is_admin']))
    return jsonify({'message': 'Email verified! Account activated.', 'user': user, **tokens}), 200


@app.route('/auth/resend-otp', methods=['POST'])
def resend_otp():
    """Resend OTP for registration or password reset."""
    d        = request.json or {}
    email    = (d.get('email') or '').strip().lower()
    otp_type = d.get('otp_type', 'register')  # 'register' | 'reset'

    if not email:
        return jsonify({'error': 'Email is required'}), 400
    if otp_type not in ('register', 'reset'):
        return jsonify({'error': 'Invalid OTP type'}), 400

    if not check_resend_rate_limit(email):
        return jsonify({'error': 'Too many resend requests. Wait 30 minutes.',
                        'code': 'RATE_LIMITED'}), 429

    if otp_type == 'register':
        from database import get_user_by_email_any
        user = get_user_by_email_any(email)
        if not user or user.get('is_active') == 1:
            return jsonify({'error': 'No pending registration for this email.'}), 404
    else:
        if not get_user_by_email(email):
            # Always succeed to prevent email enumeration
            return jsonify({'status': 'otp_sent', 'email': email}), 200

    otp     = generate_otp()
    expires = (datetime.now(timezone.utc) + timedelta(seconds=OTP_EXPIRY_SEC)).isoformat()
    invalidate_old_otps(email, otp_type)
    create_otp(email, otp_type, otp, expires)
    send_otp_email(email, otp, purpose=otp_type)

    resp = {'status': 'otp_sent', 'email': email, 'message': 'New OTP sent to your email.'}
    if DEV_MODE:
        resp['dev_note'] = 'SMTP not configured — OTP printed to Flask console'
    return jsonify(resp), 200


@app.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    """Send password-reset OTP to a registered email address."""
    d     = request.json or {}
    email = (d.get('email') or '').strip().lower()

    if not _validate_email(email):
        return jsonify({'error': 'Invalid email address'}), 422

    user = get_user_by_email(email)
    # Always respond the same way to prevent email enumeration
    if user:
        if check_resend_rate_limit(email):
            otp     = generate_otp()
            expires = (datetime.now(timezone.utc) + timedelta(seconds=OTP_EXPIRY_SEC)).isoformat()
            invalidate_old_otps(email, 'reset')
            create_otp(email, 'reset', otp, expires)
            send_otp_email(email, otp, purpose='reset')

    resp = {'status': 'otp_sent', 'email': email,
            'message': 'If an account exists for this email, an OTP has been sent.'}
    if DEV_MODE and user:
        resp['dev_note'] = 'SMTP not configured — OTP printed to Flask console'
    return jsonify(resp), 200


@app.route('/auth/verify-reset-otp', methods=['POST'])
def verify_reset_otp():
    """Verify password-reset OTP and return a short-lived reset token."""
    d        = request.json or {}
    email    = (d.get('email') or '').strip().lower()
    otp_code = (d.get('otp_code') or '').strip()

    if not email or not otp_code:
        return jsonify({'error': 'Email and OTP code are required'}), 400

    record = get_active_otp(email, 'reset')
    if not record:
        return jsonify({'error': 'OTP expired or not found. Request a new one.',
                        'code': 'OTP_EXPIRED'}), 422

    if record['attempts'] >= OTP_MAX_ATTEMPTS:
        mark_otp_used(record['id'])
        return jsonify({'error': 'Too many failed attempts. Request a new OTP.',
                        'code': 'OTP_MAX_ATTEMPTS'}), 429

    if record['otp_code'] != otp_code:
        attempts = increment_otp_attempts(record['id'])
        remaining = OTP_MAX_ATTEMPTS - attempts
        return jsonify({'error': f'Incorrect OTP. {remaining} attempt(s) remaining.',
                        'code': 'OTP_INCORRECT', 'remaining': remaining}), 422

    mark_otp_used(record['id'])

    # Issue a short-lived password-reset JWT (15 minutes, purpose='reset')
    from auth import SECRET_KEY
    now         = datetime.now(timezone.utc)
    reset_token = _jwt.encode(
        {'email': email, 'type': 'reset',
         'iat': now, 'exp': now + timedelta(minutes=15)},
        SECRET_KEY, algorithm='HS256'
    )
    return jsonify({'reset_token': reset_token, 'email': email}), 200


@app.route('/auth/reset-password', methods=['POST'])
def reset_password():
    """Reset password using a valid reset token issued after OTP verification."""
    d           = request.json or {}
    reset_token = d.get('reset_token') or ''
    new_pw      = d.get('new_password') or ''

    if not reset_token:
        return jsonify({'error': 'Reset token is required'}), 400
    if not _validate_password(new_pw):
        return jsonify({'error': 'Password must be at least 6 characters'}), 422

    try:
        from auth import SECRET_KEY
        payload = _jwt.decode(reset_token, SECRET_KEY, algorithms=['HS256'])
        if payload.get('type') != 'reset':
            return jsonify({'error': 'Invalid reset token'}), 401
        email = payload.get('email', '').lower()
    except _jwt.ExpiredSignatureError:
        return jsonify({'error': 'Reset token has expired. Start over.', 'code': 'TOKEN_EXPIRED'}), 401
    except _jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid reset token'}), 401

    user = get_user_by_email(email)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    update_user_password(user['id'], hash_password(new_pw))
    return jsonify({'message': 'Password reset successfully. You can now sign in.'}), 200


def _get_password_hash(email):
    """Fetch raw password_hash (not exposed via get_user_by_email which strips it)."""
    from database import _conn
    with _conn() as db:
        row = db.execute('SELECT password_hash FROM users WHERE email=?', (email,)).fetchone()
        return row['password_hash'] if row else None


# ── User profile ───────────────────────────────────────────────────────────────

@app.route('/user/profile', methods=['GET'])
@jwt_required
def get_profile():
    user = get_user_by_id(request.current_user['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    stats = get_user_stats(user['id'])
    return jsonify({'user': user, 'stats': stats})


@app.route('/user/profile', methods=['PUT'])
@jwt_required
def update_profile():
    d = request.json or {}
    full_name = (d.get('full_name') or '').strip()
    phone     = (d.get('phone') or '').strip()
    if not full_name:
        return jsonify({'error': 'Full name is required'}), 422
    user = update_user_profile(request.current_user['user_id'], full_name, phone)
    return jsonify({'message': 'Profile updated', 'user': user})


@app.route('/user/password', methods=['PUT'])
@jwt_required
def change_password():
    d = request.json or {}
    current_pw = d.get('current_password') or ''
    new_pw     = d.get('new_password') or ''

    if not _validate_password(new_pw):
        return jsonify({'error': 'New password must be at least 6 characters'}), 422

    email = request.current_user['email']
    if not verify_password(current_pw, _get_password_hash(email)):
        return jsonify({'error': 'Current password is incorrect'}), 401

    update_user_password(request.current_user['user_id'], hash_password(new_pw))
    return jsonify({'message': 'Password updated successfully'})


@app.route('/user/stats', methods=['GET'])
@jwt_required
def user_stats():
    stats = get_user_stats(request.current_user['user_id'])
    return jsonify(stats)


# ── Prediction (all-in-one) ────────────────────────────────────────────────────

@app.route('/predict', methods=['POST'])
@optional_jwt
@rate_limit(30, 60, 'Too many prediction requests. Please try again shortly.')
def predict_all():
    d = request.json or {}
    required = ['Temparature', 'Humidity', 'Moisture', 'Nitrogen', 'Phosphorous', 'Potassium']
    if not all(k in d for k in required):
        return jsonify({'error': 'Missing required fields', 'required': required}), 400
    try:
        T, H, Mo = float(d['Temparature']), float(d['Humidity']), float(d['Moisture'])
        N, P, K  = float(d['Nitrogen']),    float(d['Phosphorous']), float(d['Potassium'])
    except (TypeError, ValueError):
        return jsonify({'error': 'All fields must be numeric'}), 400

    crop_result = model.recommend_crops(T, H, Mo, N, P, K)
    soil_type   = crop_result['Soil Type']
    top_crop    = (crop_result['Recommended Crops'] or [None])[0]
    fert_result = model.recommend_fertilizer(top_crop, N, P, K, soil_type) if top_crop else {}
    raw_pests   = get_pests_for_crop(top_crop, soil_type) if top_crop else []
    pests       = [{k: v for k, v in p.items() if k != 'preferred_soils'} for p in raw_pests]
    soil_note   = get_soil_fertilizer_note(soil_type)

    user_id = request.current_user['user_id'] if request.current_user else None
    record_id = save_prediction(
        user_id=user_id, temperature=T, humidity=H, moisture=Mo,
        nitrogen=N, phosphorous=P, potassium=K,
        predicted_soil_type=soil_type, recommended_crop=top_crop or '',
        all_crops=crop_result['Recommended Crops'],
        crop_confidence=crop_result['Crop Confidence'],
        possible_pests=[p['name'] for p in pests],
        recommended_fertilizer=fert_result,
        soil_note=soil_note,
    )

    return jsonify({
        'id': record_id,
        'Soil Type': soil_type,
        'Soil Confidence': crop_result.get('Soil Confidence', {}),
        'Nutrient Levels': crop_result['Nutrient Levels'],
        'Recommended Crops': crop_result['Recommended Crops'],
        'Crop Confidence': crop_result['Crop Confidence'],
        'Recommended Fertilizer': fert_result,
        'Pests': pests,
        'Soil Fertilizer Note': soil_note,
        'Disclaimer': DISCLAIMER,
    })


@app.route('/recommend_crops', methods=['POST'])
@rate_limit(30, 60, 'Too many requests. Please try again shortly.')
def recommend_crops():
    d = request.json or {}
    required = ['Temparature', 'Humidity', 'Moisture', 'Nitrogen', 'Phosphorous', 'Potassium']
    if not all(k in d for k in required):
        return jsonify({'error': 'Missing required fields'}), 400
    try:
        inputs = {k: float(d[k]) for k in required}
    except Exception:
        return jsonify({'error': 'All fields must be numeric'}), 400
    result = model.recommend_crops(
        inputs['Temparature'], inputs['Humidity'], inputs['Moisture'],
        inputs['Nitrogen'], inputs['Phosphorous'], inputs['Potassium'],
    )
    return jsonify(result)


@app.route('/recommend_fertilizer', methods=['POST'])
@rate_limit(30, 60, 'Too many requests. Please try again shortly.')
def recommend_fertilizer():
    d = request.json or {}
    if not all(k in d for k in ['Crop', 'Nitrogen', 'Phosphorous', 'Potassium']):
        return jsonify({'error': 'Missing fields'}), 400
    try:
        n, p, k = float(d['Nitrogen']), float(d['Phosphorous']), float(d['Potassium'])
    except Exception:
        return jsonify({'error': 'Invalid numeric input'}), 400
    result = model.recommend_fertilizer(d['Crop'], n, p, k, soil_type=d.get('Soil Type'))
    return jsonify(result)


# ── History ─────────────────────────────────────────────────────────────────────

@app.route('/history', methods=['GET'])
@optional_jwt
def get_history():
    uid    = request.current_user['user_id'] if request.current_user else None
    page   = int(request.args.get('page', 1))
    search = request.args.get('search', '').strip()
    rows, total = get_predictions(user_id=uid, page=page, per_page=20, search=search, anonymous_only=(uid is None))
    return jsonify({'records': rows, 'total': total, 'page': page})


@app.route('/history/<int:pred_id>', methods=['GET'])
@jwt_required
def get_history_item(pred_id):
    uid  = request.current_user['user_id']
    item = get_prediction_by_id(pred_id, user_id=uid)
    if not item:
        return jsonify({'error': 'Record not found'}), 404
    return jsonify(item)


@app.route('/history/<int:pred_id>', methods=['DELETE'])
@jwt_required
def delete_history_item(pred_id):
    uid = request.current_user['user_id']
    item = get_prediction_by_id(pred_id, user_id=uid)
    if not item:
        return jsonify({'error': 'Record not found'}), 404
    delete_prediction(pred_id, user_id=uid)
    return jsonify({'message': 'Record deleted'})


# ── Admin endpoints ─────────────────────────────────────────────────────────────

@app.route('/admin/dashboard', methods=['GET'])
@admin_required
def admin_dashboard():
    return jsonify(get_admin_dashboard_stats())


@app.route('/admin/users', methods=['GET'])
@admin_required
def admin_users():
    page = int(request.args.get('page', 1))
    users, total = get_all_users(page=page, per_page=20)
    return jsonify({'users': users, 'total': total, 'page': page})


@app.route('/admin/users/<int:user_id>/status', methods=['PUT'])
@admin_required
def admin_toggle_user(user_id):
    d = request.json or {}
    is_active = bool(d.get('is_active', True))
    set_user_active(user_id, is_active)
    log_admin_action(request.current_user['user_id'], 'SET_ACTIVE',
                     f'user:{user_id}', str(is_active))
    return jsonify({'message': 'User status updated'})


@app.route('/admin/predictions', methods=['GET'])
@admin_required
def admin_predictions():
    page   = int(request.args.get('page', 1))
    search = request.args.get('search', '').strip()
    rows, total = get_predictions(page=page, per_page=20, search=search)
    return jsonify({'records': rows, 'total': total, 'page': page})


@app.route('/admin/predictions/<int:pred_id>', methods=['DELETE'])
@admin_required
def admin_delete_prediction(pred_id):
    delete_prediction(pred_id)
    log_admin_action(request.current_user['user_id'], 'DELETE', f'prediction:{pred_id}')
    return jsonify({'message': 'Prediction deleted'})


# ── Pest detection (image) ──────────────────────────────────────────────────────

@app.route('/pest-detect', methods=['POST'])
@optional_jwt
@rate_limit(20, 60, 'Too many pest-detection requests. Please try again shortly.')
def pest_detect():
    if 'image' not in request.files:
        return jsonify({'error': "No image file (field name: 'image')"}), 400
    try:
        img = Image.open(request.files['image'].stream).convert('RGB')
        raw = predict_pest_detailed(img, top_k=3)

        if not raw.get('success') or not raw.get('predictions'):
            return jsonify({
                'error': raw.get('error', 'Model not available or no prediction produced.'),
                'hint': 'Ensure the trained model file is present at pest_model/pest_model_best.h5',
            }), 503

        top         = raw['predictions'][0]
        insect_name = top.get('class', 'Unknown')
        confidence  = float(top.get('confidence', 0))
        risk_level  = 'High' if confidence >= 0.8 else ('Medium' if confidence >= 0.5 else 'Low')

        treatment   = get_treatment_for_pest(insect_name)

        user_id = request.current_user['user_id'] if request.current_user else None
        detection_id = save_pest_detection(
            user_id        = user_id,
            insect_name    = insect_name,
            scientific_name= treatment.get('scientific_name', ''),
            confidence     = confidence,
            risk_level     = risk_level,
            symptoms       = treatment.get('symptoms', ''),
            pesticide      = treatment.get('pesticide', ''),
            organic_control= treatment.get('organic', ''),
            prevention     = treatment.get('fertilizer_note', ''),
        )

        return jsonify({
            'id'             : detection_id,
            'insect_name'    : insect_name,
            'scientific_name': treatment.get('scientific_name', ''),
            'confidence'     : round(confidence * 100, 1),
            'risk_level'     : risk_level,
            'symptoms'       : treatment.get('symptoms', ''),
            'treatment': {
                'pesticide'      : treatment.get('pesticide', ''),
                'organic_control': treatment.get('organic', ''),
                'prevention'     : treatment.get('fertilizer_note', ''),
            },
            'all_predictions': [
                {'name': p.get('class'), 'confidence': round(float(p.get('confidence', 0)) * 100, 1)}
                for p in raw['predictions']
            ],
            'disclaimer': DISCLAIMER,
        })
    except Exception as e:
        return jsonify({'error': 'Pest detection failed', 'details': str(e)}), 500


@app.route('/pest-history', methods=['GET'])
@jwt_required
def pest_history():
    uid  = request.current_user['user_id']
    page = int(request.args.get('page', 1))
    rows, total = get_pest_detections(user_id=uid, page=page, per_page=20)
    return jsonify({'records': rows, 'total': total, 'page': page})


@app.route('/pest-history/<int:det_id>', methods=['DELETE'])
@jwt_required
def delete_pest_history_item(det_id):
    delete_pest_detection(det_id, user_id=request.current_user['user_id'])
    return jsonify({'message': 'Record deleted'})


@app.route('/pest_classes', methods=['GET'])
@ttl_cache(600)
def pest_classes():
    try:
        return jsonify(get_pest_classes())
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/model_info', methods=['GET'])
@ttl_cache(60)
def model_info():
    from pest_model import get_detector
    info = {'model_loaded': False, 'labels_loaded': False, 'num_classes': 0,
            'class_names': [], 'status': 'degraded'}
    try:
        detector = get_detector()
        info.update(detector.get_model_info())
        info['status'] = 'healthy' if info.get('model_loaded') and info.get('labels_loaded') else 'degraded'
    except Exception as e:
        info['error'] = str(e)
    summary_path = 'pest_model/training_summary.json'
    if os.path.exists(summary_path):
        try:
            with open(summary_path) as f:
                info['training_summary'] = json.load(f)
        except Exception:
            pass
    return jsonify(info)


@app.route('/soil_types', methods=['GET'])
@ttl_cache(600)
def soil_types():
    return jsonify({'soil_types': model.get_soil_types()})


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'version': '3.0'})


@app.route('/training_visualizations/<filename>')
def training_viz(filename):
    fp = os.path.join('pest_model', filename)
    return send_file(fp, mimetype='image/png') if os.path.exists(fp) else (
        jsonify({'error': 'Not found'}), 404)


if __name__ == '__main__':
    print('Starting KRISHX Agricultural API v3...')
    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=5000)
