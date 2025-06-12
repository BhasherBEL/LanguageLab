source .env/bin/activate
rm -f ll.db
JWT_SECRET_KEY=bonjour JWT_REFRESH_SECRET_KEY=bonjour ALLOWED_ORIGINS=http://127.0.0.1:5173 DATABASE_URL=sqlite:///./ll.db uvicorn main:app --reload
