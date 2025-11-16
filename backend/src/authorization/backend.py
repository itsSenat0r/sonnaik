import asyncio
import requests
from pwdlib import PasswordHash
from jose import jwt, JWTError
from authorization.models import *
from datetime import datetime, timedelta, timezone
from core.config import ACCESS_TOKEN_EXPIRE_HOURS, ALGORITHM, SECRET_KEY


async def create_token(data: dict):
    expire = datetime.now() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": str(data.keys),
        "name": str(data.values),
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, ALGORITHM)


async def check_user(data: dict):
    response = requests.get("http://localhost:3005/api/db/get",
                 data = {
                     "collection": "users",
                     "filter": {"username": data.username}
                 })
    if not response:
        return "USER UNKNOWN"
    if PasswordHash.recommended().verify(data.password, response["hashed_password"]):
        return {response["user_id"]: data.username}
    else:
        return "INVALID PASSWORD"