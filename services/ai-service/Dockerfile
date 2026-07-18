FROM python:3.13-slim

RUN useradd -m appuser

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

USER appuser
EXPOSE 4002
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4002", "--workers", "2"]
