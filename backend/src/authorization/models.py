from pydantic import BaseModel

class LoginCredentialsRequest(BaseModel):
    username: str
    password: str

class LoginCredentialsResponse(BaseModel):
    access_token: str
    user: dict

class Error(BaseModel):
    detail: str