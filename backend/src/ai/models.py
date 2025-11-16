from typing import Dict
from fastapi import WebSocket
from pydantic import BaseModel

class ConnectionManager:
    def __init__(self):
        self.connections: Dict[int, Dict[int, WebSocket]] = {}

    async def connect(self,
                      ws: WebSocket,
                      user_id: int, 
                      chat_id: int):
        await ws.accept()
        if chat_id not in self.connections[user_id]:
            self.connections[user_id] = {}
        self.connections[user_id][chat_id] = ws

    async def disconnect(self,
                         user_id: int,
                         chat_id: int):
        if chat_id in self.connections and user_id in self.connections:
            del self.connections[user_id][chat_id]
            if not self.connections[chat_id]:
                del self.connections[user_id]

class WebSocketRequest:
    token: str