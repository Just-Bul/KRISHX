"""
JWT + bcrypt authentication utilities for KRISHX backend.
"""
import os
import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify

_DEFAULT_SECRET = 'krishx-agri-jwt-secret-2024-XyZ9q8r7'
SECRET_KEY = os.environ.get('KRISHX_SECRET', _DEFAULT_SECRET)

# Warn loudly if running with the insecure default key outside dev
if SECRET_KEY == _DEFAULT_SECRET and os.environ.get('FLASK_ENV') != 'development':
    import warnings
    warnings.warn(
        '\n[KRISHX] SECURITY WARNING: KRISHX_SECRET is not set. '
        'Using the default insecure key. '
        'Set KRISHX_SECRET env var to a strong random string before deploying.',
        stacklevel=2,
    )

ACCESS_EXPIRY  = timedelta(hours=24)
REFRESH_EXPIRY = timedelta(days=30)


# ── Password utilities ──────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


# ── Token utilities ─────────────────────────────────────────────────────────

def generate_tokens(user_id: int, email: str, is_admin: bool = False) -> dict:
    now = datetime.now(timezone.utc)
    access = {
        'user_id': user_id,
        'email': email,
        'is_admin': is_admin,
        'type': 'access',
        'iat': now,
        'exp': now + ACCESS_EXPIRY,
    }
    refresh = {
        'user_id': user_id,
        'email': email,
        'is_admin': is_admin,
        'type': 'refresh',
        'iat': now,
        'exp': now + REFRESH_EXPIRY,
    }
    return {
        'access_token': jwt.encode(access, SECRET_KEY, algorithm='HS256'),
        'refresh_token': jwt.encode(refresh, SECRET_KEY, algorithm='HS256'),
        'expires_in': int(ACCESS_EXPIRY.total_seconds()),
    }


def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])


def _extract_token(req) -> str | None:
    auth = req.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        return auth[7:]
    return req.headers.get('X-Token') or None


# ── Route decorators ────────────────────────────────────────────────────────

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = _extract_token(request)
        if not token:
            return jsonify({'error': 'Authentication required', 'code': 'NO_TOKEN'}), 401
        try:
            payload = decode_token(token)
            if payload.get('type') != 'access':
                return jsonify({'error': 'Invalid token type', 'code': 'INVALID_TOKEN'}), 401
            request.current_user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired', 'code': 'TOKEN_EXPIRED'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token', 'code': 'INVALID_TOKEN'}), 401
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = _extract_token(request)
        if not token:
            return jsonify({'error': 'Authentication required', 'code': 'NO_TOKEN'}), 401
        try:
            payload = decode_token(token)
            if payload.get('type') != 'access':
                return jsonify({'error': 'Invalid token type', 'code': 'INVALID_TOKEN'}), 401
            if not payload.get('is_admin'):
                return jsonify({'error': 'Admin access required', 'code': 'FORBIDDEN'}), 403
            request.current_user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired', 'code': 'TOKEN_EXPIRED'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token', 'code': 'INVALID_TOKEN'}), 401
        return f(*args, **kwargs)
    return decorated


def optional_jwt(f):
    """Attach user info if token present, but don't block unauthenticated requests."""
    @wraps(f)
    def decorated(*args, **kwargs):
        request.current_user = None
        token = _extract_token(request)
        if token:
            try:
                payload = decode_token(token)
                if payload.get('type') == 'access':
                    request.current_user = payload
            except Exception:
                pass
        return f(*args, **kwargs)
    return decorated
