# # Build stage
# FROM python:3.11-slim as builder

# # Set environment variables
# ENV PYTHONDONTWRITEBYTECODE=1 \
#     PYTHONUNBUFFERED=1 \
#     PIP_NO_CACHE_DIR=1 \
#     PIP_DISABLE_PIP_VERSION_CHECK=1

# # Install system dependencies
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     build-essential \
#     libpq-dev \
#     && rm -rf /var/lib/apt/lists/*

# # Create and activate virtual environment
# RUN python -m venv /opt/venv
# ENV PATH="/opt/venv/bin:$PATH"

# # Install Python dependencies
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# # Final stage
# FROM python:3.11-slim

# # Install system dependencies
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     nginx \
#     supervisor \
#     libpq5 \
#     curl \
#     && rm -rf /var/lib/apt/lists/*

# # Copy virtual environment from builder
# COPY --from=builder /opt/venv /opt/venv
# ENV PATH="/opt/venv/bin:$PATH"

# # Create non-root user
# RUN useradd -m -s /bin/bash app

# # Set up Nginx
# COPY nginx.conf /etc/nginx/nginx.conf
# RUN rm /etc/nginx/sites-enabled/default

# # Set up Supervisor
# COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# # Create necessary directories
# RUN mkdir -p /app/staticfiles /app/media /var/log/gunicorn /var/log/nginx /var/log/celery /var/log/supervisor

# # Copy project files
# COPY . /app/
# WORKDIR /app

# # Set permissions
# RUN chown -R app:app /app /var/log/gunicorn /var/log/nginx /var/log/celery /var/log/supervisor && \
#     chmod -R 755 /app /var/log/gunicorn /var/log/nginx /var/log/celery /var/log/supervisor

# # Copy the test script
# COPY test_env.py /app/test_env.py
# RUN chmod +x /app/test_env.py

# # Create a startup script that runs Gunicorn directly
# RUN echo '#!/bin/bash\n\
# echo "=== Starting Environment Test ==="\n\
# python /app/test_env.py\n\
# echo "=== Starting Supervisor ==="\n\
# exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf' > /app/start.sh && \
# chmod +x /app/start.sh

# # Copy the RDS root certificate bundle
# COPY rds-combined-ca-bundle.pem /app/rds-combined-ca-bundle.pem
# RUN chmod 644 /app/rds-combined-ca-bundle.pem

# # Expose port
# EXPOSE 80

# # Use the startup script as the entrypoint
# ENTRYPOINT ["/app/start.sh"] 

# Dockerfile

# Build stage
FROM python:3.11-slim as builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user with home directory
RUN useradd -m -d /home/app -s /bin/bash app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set up Nginx
COPY nginx.conf /etc/nginx/nginx.conf
RUN rm /etc/nginx/sites-enabled/default

# Set up Supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create necessary directories
RUN mkdir -p /app/staticfiles /app/media /var/log/gunicorn /var/log/nginx /var/log/celery /var/log/supervisor

# Copy project files
COPY . /app/
WORKDIR /app

# Copy the RDS root certificate bundle and set permissions
COPY rds-combined-ca-bundle.pem /app/rds-combined-ca-bundle.pem
RUN chown app:app /app/rds-combined-ca-bundle.pem && chmod 644 /app/rds-combined-ca-bundle.pem

# Set permissions for app files and logs
RUN chown -R app:app /app /var/log/gunicorn /var/log/nginx /var/log/celery /var/log/supervisor && \
    chmod -R 755 /app /var/log/gunicorn /var/log/nginx /var/log/celery /var/log/supervisor

# Copy the test script
COPY test_env.py /app/test_env.py
RUN chmod +x /app/test_env.py && chown app:app /app/test_env.py

# Create a startup script that runs Gunicorn directly
RUN echo '#!/bin/bash\n\
echo "=== Starting Environment Test ==="\n\
python /app/test_env.py\n\
echo "=== Starting Supervisor ==="\n\
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf' > /app/start.sh && \
chmod +x /app/start.sh && chown app:app /app/start.sh

# Expose port
EXPOSE 80

# Switch to non-root user
#USER app

# Use the startup script as the entrypoint
ENTRYPOINT ["/app/start.sh"]
