from db.router import db_router
from authorization.router import auth_router
from ai.router import ai_router
routers = (db_router, auth_router, ai_router)