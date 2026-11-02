# ── Stage 1: Build dependencies ───────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ \
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-prod.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements-prod.txt

# ── Stage 2: Production image ──────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Only the shared libraries needed at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Copy application source (training scripts, raw CSVs, logs excluded via .dockerignore)
COPY app.py auth.py database.py email_service.py \
     model.py pest_model.py pest_data.py optimized_model.py \
     gunicorn.conf.py ./

# Copy model artifacts
COPY pest_model/ ./pest_model/
COPY data_core.csv crop_model.pkl soil_model.pkl ./

# Persistent data directory — mount a Cloud volume here or use Cloud SQL
RUN mkdir -p /data
ENV DB_PATH=/data/krishx.db

# Runtime settings
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

EXPOSE 8080

CMD exec gunicorn --config gunicorn.conf.py app:app
