from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import routers


api = FastAPI()

for router in routers:
    api.include_router(router)

origins = ["*"]

api.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
