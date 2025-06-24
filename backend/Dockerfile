# Pull base image
FROM python:3.11-slim

# Set environment variables (modern syntax)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /code/backend

# Upgrade pip
RUN pip install --upgrade pip

# Copy requirements and install them using uv
COPY ./requirements.txt .
RUN pip install uv
RUN uv pip install -r requirements.txt --system

# Install required system dependencies
RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libjpeg-dev \
    libpng-dev \
    libpq-dev \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Copy project code
COPY . /code/backend/

# Ensure you're running as root (optional but safe here)
USER root
