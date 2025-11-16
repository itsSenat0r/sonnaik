from pydantic import BaseModel

class NewMsgRequestBody(BaseModel):
    user_id: str
    text: str
    token: str
    chat_id: str