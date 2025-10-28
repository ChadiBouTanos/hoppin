FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create staticfiles directory (but don't run collectstatic here!)
RUN mkdir -p /app/staticfiles

# Remove this line - don't run collectstatic during build:
# RUN python manage.py collectstatic --noinput

EXPOSE 8000

