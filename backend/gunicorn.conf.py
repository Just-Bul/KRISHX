"""
Gunicorn configuration for KRISHX production deployment.
Used by Dockerfile CMD and app.yaml entrypoint.
"""
import os

# ── Binding ────────────────────────────────────────────────────────────────────
bind = f"0.0.0.0:{os.environ.get('PORT', '8080')}"

# ── Workers ────────────────────────────────────────────────────────────────────
# Keep workers=1 — TensorFlow model is large and multi-worker would OOM.
# Use threads for concurrent request handling instead. Horizontal scaling
# (see app.yaml automatic_scaling / max_concurrent_requests) is the primary
# lever for handling many simultaneous users — not stacking more
# workers/threads on a single instance sharing one loaded TF model.
workers      = 1
threads      = 6
worker_class = 'gthread'

# ── Timeouts ───────────────────────────────────────────────────────────────────
# Pest detection can take 10-30s on cold start; allow 120s.
timeout    = 120
keepalive  = 5
graceful_timeout = 60

# ── Logging ───────────────────────────────────────────────────────────────────
# Log to stdout/stderr so Cloud Run / App Engine captures them automatically.
accesslog = '-'
errorlog  = '-'
loglevel  = 'info'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s %(D)sµs'

# ── Worker lifecycle ───────────────────────────────────────────────────────────
# Recycle workers periodically to prevent gradual memory growth from TensorFlow.
max_requests        = 500
max_requests_jitter = 50

# ── Security ──────────────────────────────────────────────────────────────────
forwarded_allow_ips = '*'   # Trust GCP load balancer X-Forwarded-For
