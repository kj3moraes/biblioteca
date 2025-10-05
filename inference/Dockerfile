FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Copy poetry files
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install torch
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install ultralytics
RUN pip install --no-cache-dir ultralytics --no-deps

# Copy application code
COPY . .

# Create models directory and download models (if not present)
RUN mkdir -p models

# Expose port
EXPOSE 8080

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
