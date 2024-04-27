import os
import secrets
import logging

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///../languagelab.sqlite")

# JWT
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
REFRESH_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", "10080")
)  # 7 days
ALGORITHM = "HS256"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
JWT_REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY", secrets.token_urlsafe(32))
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@admin.tld")
ADMIN_NICKNAME = os.getenv("ADMIN_NICKNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin")
DEBUG = os.getenv("DEBUG", "false").lower() in ("true", "1")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
CALCOM_SECRET = os.getenv("CALCOM_SECRET", "calcom_secret")

