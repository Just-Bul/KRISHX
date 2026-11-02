"""
SQLite database layer for KRISHX — users, predictions, and admin data.
"""
import sqlite3
import json
import os
from datetime import datetime

# Allow DB path to be overridden via environment variable (used in Docker / Cloud Run)
DB_PATH = os.environ.get('DB_PATH') or os.path.join(os.path.dirname(__file__), 'krishx.db')


def _conn():
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    c.execute('PRAGMA foreign_keys = ON')
    # WAL lets reads proceed concurrently with writes (default journal mode
    # serializes them); busy_timeout makes concurrent gunicorn threads
    # wait-and-retry instead of raising "database is locked".
    c.execute('PRAGMA journal_mode = WAL')
    c.execute('PRAGMA synchronous = NORMAL')
    c.execute('PRAGMA busy_timeout = 5000')
    return c


def init_db():
    with _conn() as db:
        db.executescript('''
            CREATE TABLE IF NOT EXISTS users (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name       TEXT    NOT NULL,
                email           TEXT    NOT NULL UNIQUE,
                phone           TEXT,
                password_hash   TEXT    NOT NULL,
                is_admin        INTEGER NOT NULL DEFAULT 0,
                profile_image   TEXT,
                created_at      TEXT    NOT NULL,
                last_login      TEXT,
                is_active       INTEGER NOT NULL DEFAULT 1,
                email_verified  INTEGER NOT NULL DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS predictions (
                id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id             INTEGER REFERENCES users(id) ON DELETE SET NULL,
                temperature         REAL,
                humidity            REAL,
                moisture            REAL,
                nitrogen            REAL,
                phosphorous         REAL,
                potassium           REAL,
                predicted_soil_type TEXT,
                recommended_crop    TEXT,
                all_crops           TEXT,
                crop_confidence     TEXT,
                possible_pests      TEXT,
                recommended_fertilizer TEXT,
                soil_note           TEXT,
                timestamp           TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS admin_logs (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_id   INTEGER REFERENCES users(id),
                action     TEXT,
                target     TEXT,
                details    TEXT,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS pest_detections (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id          INTEGER REFERENCES users(id) ON DELETE SET NULL,
                insect_name      TEXT,
                scientific_name  TEXT,
                confidence       REAL,
                risk_level       TEXT,
                symptoms         TEXT,
                pesticide        TEXT,
                organic_control  TEXT,
                prevention       TEXT,
                timestamp        TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS otp_codes (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                email       TEXT    NOT NULL,
                otp_type    TEXT    NOT NULL,
                otp_code    TEXT    NOT NULL,
                created_at  TEXT    NOT NULL,
                expires_at  TEXT    NOT NULL,
                is_used     INTEGER NOT NULL DEFAULT 0,
                attempts    INTEGER NOT NULL DEFAULT 0
            );

            CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email, otp_type);
        ''')

        # Migration: add email_verified to pre-existing databases (existing users → verified)
        for col, defval in [('email_verified', '1')]:
            try:
                db.execute(f'ALTER TABLE users ADD COLUMN {col} INTEGER NOT NULL DEFAULT {defval}')
            except Exception:
                pass  # column already exists

        # Seed a default admin account (password: Admin@123)
        from auth import hash_password
        existing = db.execute("SELECT id FROM users WHERE is_admin=1").fetchone()
        if not existing:
            db.execute(
                '''INSERT INTO users (full_name, email, phone, password_hash, is_admin, created_at)
                   VALUES (?, ?, ?, ?, 1, ?)''',
                ('KRISHX Admin', 'admin@krishx.com', '0000000000',
                 hash_password('Admin@123'), datetime.utcnow().isoformat())
            )


# ── User operations ─────────────────────────────────────────────────────────

def create_user(full_name, email, phone, password_hash,
                is_active=1, email_verified=1):
    with _conn() as db:
        try:
            db.execute(
                '''INSERT INTO users
                   (full_name, email, phone, password_hash, is_active, email_verified, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)''',
                (full_name, email, phone, password_hash,
                 int(is_active), int(email_verified),
                 datetime.utcnow().isoformat())
            )
            row = db.execute('SELECT * FROM users WHERE email=?', (email,)).fetchone()
            return _user_dict(row)
        except sqlite3.IntegrityError:
            return None  # email already exists


def get_user_by_email_any(email):
    """Fetch user regardless of is_active status — used for registration duplicate check."""
    with _conn() as db:
        row = db.execute('SELECT * FROM users WHERE email=?', (email,)).fetchone()
        return _user_dict(row) if row else None


def delete_pending_user(email):
    """Remove an unverified (is_active=0) registration so re-registration is possible."""
    with _conn() as db:
        db.execute('DELETE FROM users WHERE email=? AND is_active=0', (email,))


def activate_user(email):
    """Set is_active=1, email_verified=1 after successful OTP verification."""
    with _conn() as db:
        db.execute(
            'UPDATE users SET is_active=1, email_verified=1 WHERE email=?', (email,)
        )


def get_user_by_email(email):
    with _conn() as db:
        row = db.execute('SELECT * FROM users WHERE email=? AND is_active=1', (email,)).fetchone()
        return _user_dict(row) if row else None


def get_user_by_id(user_id):
    with _conn() as db:
        row = db.execute('SELECT * FROM users WHERE id=?', (user_id,)).fetchone()
        return _user_dict(row) if row else None


def update_last_login(user_id):
    with _conn() as db:
        db.execute('UPDATE users SET last_login=? WHERE id=?',
                   (datetime.utcnow().isoformat(), user_id))


def update_user_profile(user_id, full_name, phone, profile_image=None):
    with _conn() as db:
        if profile_image is not None:
            db.execute('UPDATE users SET full_name=?, phone=?, profile_image=? WHERE id=?',
                       (full_name, phone, profile_image, user_id))
        else:
            db.execute('UPDATE users SET full_name=?, phone=? WHERE id=?',
                       (full_name, phone, user_id))
        return get_user_by_id(user_id)


def update_user_password(user_id, new_hash):
    with _conn() as db:
        db.execute('UPDATE users SET password_hash=? WHERE id=?', (new_hash, user_id))


def get_all_users(page=1, per_page=20):
    offset = (page - 1) * per_page
    with _conn() as db:
        rows = db.execute(
            'SELECT * FROM users ORDER BY id DESC LIMIT ? OFFSET ?',
            (per_page, offset)
        ).fetchall()
        total = db.execute('SELECT COUNT(*) FROM users').fetchone()[0]
        return [_user_dict(r) for r in rows], total


def set_user_active(user_id, is_active):
    with _conn() as db:
        db.execute('UPDATE users SET is_active=? WHERE id=?', (int(is_active), user_id))


def _user_dict(row):
    if row is None:
        return None
    d = dict(row)
    d.pop('password_hash', None)
    return d


# ── OTP operations ──────────────────────────────────────────────────────────

def create_otp(email, otp_type, otp_code, expires_at):
    with _conn() as db:
        db.execute(
            '''INSERT INTO otp_codes (email, otp_type, otp_code, created_at, expires_at)
               VALUES (?, ?, ?, ?, ?)''',
            (email, otp_type, otp_code,
             datetime.utcnow().isoformat(), expires_at)
        )
        return db.execute('SELECT last_insert_rowid()').fetchone()[0]


def invalidate_old_otps(email, otp_type):
    """Mark all previous OTPs for this email/type as used before issuing a new one."""
    with _conn() as db:
        db.execute(
            "UPDATE otp_codes SET is_used=1 WHERE email=? AND otp_type=? AND is_used=0",
            (email, otp_type)
        )


def get_active_otp(email, otp_type):
    """Return the most recent unused, unexpired OTP record for (email, type)."""
    with _conn() as db:
        now = datetime.utcnow().isoformat()
        row = db.execute(
            '''SELECT * FROM otp_codes
               WHERE email=? AND otp_type=? AND is_used=0 AND expires_at > ?
               ORDER BY id DESC LIMIT 1''',
            (email, otp_type, now)
        ).fetchone()
        return dict(row) if row else None


def increment_otp_attempts(otp_id):
    with _conn() as db:
        db.execute('UPDATE otp_codes SET attempts=attempts+1 WHERE id=?', (otp_id,))
        row = db.execute('SELECT attempts FROM otp_codes WHERE id=?', (otp_id,)).fetchone()
        return row['attempts'] if row else 0


def mark_otp_used(otp_id):
    with _conn() as db:
        db.execute('UPDATE otp_codes SET is_used=1 WHERE id=?', (otp_id,))


# ── Prediction operations ────────────────────────────────────────────────────

def save_prediction(user_id, temperature, humidity, moisture, nitrogen,
                    phosphorous, potassium, predicted_soil_type, recommended_crop,
                    all_crops, crop_confidence, possible_pests, recommended_fertilizer,
                    soil_note=''):
    with _conn() as db:
        db.execute(
            '''INSERT INTO predictions
               (user_id, temperature, humidity, moisture, nitrogen, phosphorous, potassium,
                predicted_soil_type, recommended_crop, all_crops, crop_confidence,
                possible_pests, recommended_fertilizer, soil_note, timestamp)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
            (user_id, temperature, humidity, moisture, nitrogen, phosphorous, potassium,
             predicted_soil_type, recommended_crop,
             json.dumps(all_crops), json.dumps(crop_confidence),
             json.dumps(possible_pests), json.dumps(recommended_fertilizer),
             soil_note, datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'))
        )
        return db.execute('SELECT last_insert_rowid()').fetchone()[0]


def get_predictions(user_id=None, page=1, per_page=20, search='', anonymous_only=False):
    offset = (page - 1) * per_page
    with _conn() as db:
        if user_id:
            where = 'WHERE p.user_id=?'
            params = [user_id]
        elif anonymous_only:
            where = 'WHERE p.user_id IS NULL'
            params = []
        else:
            where = 'WHERE 1=1'
            params = []
        if search:
            where += ' AND (p.recommended_crop LIKE ? OR p.predicted_soil_type LIKE ?)'
            params += [f'%{search}%', f'%{search}%']
        rows = db.execute(
            f'''SELECT p.*, u.full_name, u.email
                FROM predictions p LEFT JOIN users u ON p.user_id=u.id
                {where} ORDER BY p.id DESC LIMIT ? OFFSET ?''',
            params + [per_page, offset]
        ).fetchall()
        total = db.execute(
            f'SELECT COUNT(*) FROM predictions p {where}', params
        ).fetchone()[0]
        return [_pred_dict(r) for r in rows], total


def get_prediction_by_id(pred_id, user_id=None):
    with _conn() as db:
        if user_id:
            row = db.execute(
                'SELECT * FROM predictions WHERE id=? AND user_id=?', (pred_id, user_id)
            ).fetchone()
        else:
            row = db.execute('SELECT * FROM predictions WHERE id=?', (pred_id,)).fetchone()
        return _pred_dict(row) if row else None


def delete_prediction(pred_id, user_id=None):
    with _conn() as db:
        if user_id:
            db.execute('DELETE FROM predictions WHERE id=? AND user_id=?', (pred_id, user_id))
        else:
            db.execute('DELETE FROM predictions WHERE id=?', (pred_id,))


def get_user_stats(user_id):
    with _conn() as db:
        total = db.execute(
            'SELECT COUNT(*) FROM predictions WHERE user_id=?', (user_id,)
        ).fetchone()[0]
        week = db.execute(
            "SELECT COUNT(*) FROM predictions WHERE user_id=? AND timestamp >= date('now','-7 days')",
            (user_id,)
        ).fetchone()[0]
        top_crop = db.execute(
            '''SELECT recommended_crop, COUNT(*) cnt FROM predictions
               WHERE user_id=? GROUP BY recommended_crop ORDER BY cnt DESC LIMIT 1''',
            (user_id,)
        ).fetchone()
        top_soil = db.execute(
            '''SELECT predicted_soil_type, COUNT(*) cnt FROM predictions
               WHERE user_id=? GROUP BY predicted_soil_type ORDER BY cnt DESC LIMIT 1''',
            (user_id,)
        ).fetchone()
        return {
            'total_predictions': total,
            'predictions_this_week': week,
            'top_crop': top_crop['recommended_crop'] if top_crop else None,
            'top_soil': top_soil['predicted_soil_type'] if top_soil else None,
        }


def _pred_dict(row):
    if row is None:
        return None
    d = dict(row)
    for key in ('all_crops', 'crop_confidence', 'possible_pests', 'recommended_fertilizer'):
        if key in d and isinstance(d[key], str):
            try:
                d[key] = json.loads(d[key])
            except Exception:
                pass
    return d


# ── Admin operations ─────────────────────────────────────────────────────────

def get_admin_dashboard_stats():
    with _conn() as db:
        users    = db.execute('SELECT COUNT(*) FROM users WHERE is_admin=0').fetchone()[0]
        preds    = db.execute('SELECT COUNT(*) FROM predictions').fetchone()[0]
        today    = db.execute(
            "SELECT COUNT(*) FROM predictions WHERE timestamp >= date('now')"
        ).fetchone()[0]
        top_crop = db.execute(
            '''SELECT recommended_crop, COUNT(*) cnt FROM predictions
               GROUP BY recommended_crop ORDER BY cnt DESC LIMIT 5'''
        ).fetchall()
        top_soil = db.execute(
            '''SELECT predicted_soil_type, COUNT(*) cnt FROM predictions
               GROUP BY predicted_soil_type ORDER BY cnt DESC LIMIT 5'''
        ).fetchall()
        return {
            'total_users': users,
            'total_predictions': preds,
            'predictions_today': today,
            'top_crops': [{'crop': r['recommended_crop'], 'count': r['cnt']} for r in top_crop],
            'top_soils': [{'soil': r['predicted_soil_type'], 'count': r['cnt']} for r in top_soil],
        }


def log_admin_action(admin_id, action, target, details=''):
    with _conn() as db:
        db.execute(
            'INSERT INTO admin_logs (admin_id, action, target, details, created_at) VALUES (?,?,?,?,?)',
            (admin_id, action, target, details, datetime.utcnow().isoformat())
        )


# ── Pest Detection operations ─────────────────────────────────────────────────

def save_pest_detection(user_id, insect_name, scientific_name='', confidence=0.0,
                        risk_level='Low', symptoms='', pesticide='',
                        organic_control='', prevention=''):
    with _conn() as db:
        db.execute(
            '''INSERT INTO pest_detections
               (user_id, insect_name, scientific_name, confidence, risk_level,
                symptoms, pesticide, organic_control, prevention, timestamp)
               VALUES (?,?,?,?,?,?,?,?,?,?)''',
            (user_id, insect_name, scientific_name, confidence, risk_level,
             symptoms, pesticide, organic_control, prevention,
             datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'))
        )
        return db.execute('SELECT last_insert_rowid()').fetchone()[0]


def get_pest_detections(user_id=None, page=1, per_page=20):
    offset = (page - 1) * per_page
    with _conn() as db:
        if user_id:
            rows = db.execute(
                '''SELECT * FROM pest_detections WHERE user_id=?
                   ORDER BY id DESC LIMIT ? OFFSET ?''',
                (user_id, per_page, offset)
            ).fetchall()
            total = db.execute(
                'SELECT COUNT(*) FROM pest_detections WHERE user_id=?', (user_id,)
            ).fetchone()[0]
        else:
            rows = db.execute(
                'SELECT * FROM pest_detections ORDER BY id DESC LIMIT ? OFFSET ?',
                (per_page, offset)
            ).fetchall()
            total = db.execute('SELECT COUNT(*) FROM pest_detections').fetchone()[0]
        return [dict(r) for r in rows], total


def delete_pest_detection(detection_id, user_id=None):
    with _conn() as db:
        if user_id:
            db.execute('DELETE FROM pest_detections WHERE id=? AND user_id=?',
                       (detection_id, user_id))
        else:
            db.execute('DELETE FROM pest_detections WHERE id=?', (detection_id,))
