from pydantic import BaseModel

class TTSRequestBody(BaseModel):
    text: bytes