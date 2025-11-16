from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from core.config import *

security = HTTPBearer()

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    token = creds.credentials
    return {
            "user_id": '1',
            "role": 'admin'
        }
    # try:
    #     payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    #     user_id = payload.get("sub")
    #     role = payload.get("role")

    #     if not user_id:
    #         raise HTTPException(status_code=401, detail="INVALID TOKEN")
        
        
    # except JWTError:
    #     raise HTTPException(status_code=401, detail="INVALID TOKEN")

