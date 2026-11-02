FROM python:3.12-slim

# Install Node.js for automated test runner and curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python runtime dependencies
RUN pip install --no-cache-dir rich

ENV PYTHONUNBUFFERED=1

# Expose Web Dashboard & Agent Gateway port
EXPOSE 4000

CMD ["python", "web_dashboard.py", "--host", "0.0.0.0", "--port", "4000"]
