import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException
from ai.models import ConnectionManager, WebSocketRequest
import requests
from fastapi.responses import StreamingResponse
from io import BytesIO
from ai.tts.models import TTSRequestBody
from ai.tts.backend import ai_tts_call
from ai.ollama_ai import ai_ollama_call
import websockets
import traceback
import wave
import json

ai_router = APIRouter(
    prefix = "/ai"
)


tts_router = APIRouter(
    prefix='/ai'
)

stt_router = APIRouter(
    prefix = "/ai"
)
manager = ConnectionManager()

@ai_router.websocket("/ws/{token}/{user_id}/{chat_id}")
async def websocket_endpoint(ws: WebSocket, 
                             token: str,
                             user_id: int,
                             chat_id: int):
    if token not in requests.get('http://127.0.0.1:2717/api/db/get', params = {
        "filter": {"token": token}
    }):
        return "INCORRECT TOKEN"
    
    await manager.connect(ws, user_id, chat_id)

    try:
        while True:
            raw = await ws.receive_bytes()
            if raw:
                uri = "ws://localhost:2700"

                try:
                    async with websockets.connect(uri) as ws:
                        wf = wave.open("audio.wav", "rb")
                        sample_rate = wf.getframerate()
                        await ws.send('{ "config" : { "sample_rate" : %d } }' % sample_rate)

                        buffer_size = int(sample_rate * 0.2)

                        while True:
                            chunk = wf.readframes(buffer_size)
                            if not chunk:
                                break
                            await ws.send(chunk)
                            await ws.recv() 

                        await ws.send('{"eof" : 1}')
                        msg = await ws.recv()
                        result = json.loads(msg)
                        if "text" in result:
                            return result["text"]

                except Exception as err:
                    print(''.join(traceback.format_exception(type(err), err, err.__traceback__)))
    
    except WebSocketDisconnect:
        await manager.disconnect(user_id, chat_id)



@tts_router.get('/tts')
async def tts_send_data(text: TTSRequestBody):
    audio = await ai_tts_call(text.text, 'baya')
    return StreamingResponse(BytesIO(audio), media_type='audio/wav')