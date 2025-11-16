from silero_stress import load_accentor


async def accentizer(text: str):
    accentor = load_accentor()
    sent_data = text
    return accentor(sent_data)