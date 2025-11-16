from ollama import AsyncClient
import asyncio


async def ai_ollama_call(msg: bytes):
    client = AsyncClient()

    message = [
        {
            'role': 'user',
            'content': str(msg, 'utf-8') + "\n Расскажи подробно о том, что означает этот сон со стороны психологии и работы мозга. Не додумывай, бери данные из тех знаний, которые у тебя есть. Расскажи в нескольких пунктах что означает сон, как его улучшить(если он плохой) и чего стоит сторониться для улучшения своих снов",
        },
    ]

    async for part in client.chat('gpt-oss:120b-cloud', messages=[message], stream=True):
        data = part.message.content
        if data:
            yield bytes(data, 'utf-8')