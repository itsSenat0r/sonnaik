from fastapi import APIRouter, Depends
from api.security import get_current_user
from db.models import *
from db.backend import create, get_data, update, delete
import asyncio

db_router = APIRouter(
    prefix = "/db"
)

@db_router.post('/create')
async def api_create(data: CreateCollectionData, user = Depends(get_current_user)):
    if user["role"] != "admin":
        return "UNAUTHORIZED ACCESS"
    return await create(data)

@db_router.post('/delete')
async def api_delete(data: DeleteCollectionData, user = Depends(get_current_user)):
    if user["role"] != "admin":
        return "UNAUTHORIZED ACCESS"
    return await delete(data)

@db_router.post('/update')
async def api_update(data: UpdateCollectionData, user = Depends(get_current_user)):
    if user["role"] != "admin":
        return "UNAUTHORIZED ACCESS"
    return await update(data)

@db_router.get('/get')
async def api_get(data: GetCollectionData, user = Depends(get_current_user)):
    if user["role"] != "admin":
        return "UNAUTHORIZED ACCESS"
    return await get_data(data)
