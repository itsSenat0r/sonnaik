import torch
import os
import uuid
from ai.tts.accentizer import accentizer

async def ai_tts_call(text: bytes, speaker: str) -> bytes:
    device = torch.device('cpu')
    torch.set_num_threads(4)
    local_file = 'model.pt'

    if not os.path.isfile(local_file):
        torch.hub.download_url_to_file(
            'https://models.silero.ai/models/tts/ru/v5_ru.pt',
            local_file
        )

    model = torch.package.PackageImporter(local_file).load_pickle("tts_models", "model")
    model.to(device)

    
    out_path = f"tmp_{uuid.uuid4()}.wav"
    data = await accentizer(text.decode('utf-8'))
    
    model.save_wav(
        text=data,
        speaker=speaker,
        sample_rate=48000,
        audio_path=out_path
    )

    
    with open(out_path, "rb") as f:
        audio_bytes = f.read()

    
    os.remove(out_path)

    return audio_bytes