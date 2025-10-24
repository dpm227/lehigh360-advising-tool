## 🚀 Running the App - Backend
### 🧪 Local (Dev Mode)
Start the backend:
```bash
python3 app.py
```

### 🐳 With Docker
```bash
docker build -t lu360-app .
docker run --env-file .env -p 127.0.0.1:8000:8000 lu360-app
```