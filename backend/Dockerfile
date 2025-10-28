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

# Start the application with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "backend.wsgi:application"]