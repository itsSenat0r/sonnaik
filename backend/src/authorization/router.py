from fastapi import APIRouter, Response
from authorization.models import *
from authorization.backend import create_token, check_user
import jwt
import asyncio

auth_router = APIRouter(
    prefix = "/auth"
)

@auth_router.post("/login")
async def login(data: LoginCredentialsRequest,
                response: Response):
    creds_data = await check_user(data)

    if creds_data == "USER UNKNOWN":
        return "USER UNKNOWN"
    if creds_data == "INVALID PASSWORD":
        return "INVALID PASSWORD"
    response.set_cookie(
        key="jwt",
        value=await create_token(creds_data),
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=86400
    )
    return {"msg": "OK"}

@auth_router.post("/logout")
async def logout():
    return