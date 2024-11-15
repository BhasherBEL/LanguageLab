source .venv/bin/activate
JWT_SECRET_KEY=bonjour JWT_REFRESH_SECRET_KEY=bonjour ALLOWED_ORIGINS=http://127.0.0.1:5173 uvicorn main:app --reload
