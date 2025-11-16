from fastapi import APIRouter
from messages.models import NewMsgRequestBody
import requests

msg_router = APIRouter(
    prefix='/msg'
)

@msg_router.get("/new")
async def new_msg(body: NewMsgRequestBody):
    data = requests.get('http://127.0.0.1:2717/api/db/create', params = {
        
    })