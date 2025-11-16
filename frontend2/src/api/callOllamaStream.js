const API_BASE_URL = 'http://localhost:2717';

export async function* callOllamaStream(userText) {
  try {
    console.log('Отправка запроса к /ai/ollama:', userText);
    
    // Backend ожидает bytes в формате base64 для Pydantic bytes field
    const encoder = new TextEncoder();
    const textBytes = encoder.encode(userText);
    const base64 = btoa(String.fromCharCode(...textBytes));

    const response = await fetch(`${API_BASE_URL}/ai/ollama`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: base64 }),
    });

    console.log('Ответ получен, status:', response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Ошибка ответа:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let totalChunks = 0;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        totalChunks++;
        const decoded = decoder.decode(value, { stream: true });
        console.log(`Chunk ${totalChunks} получен, длина:`, decoded.length);
        // Декодируем байты в текст
        yield decoded;
      }
    }
    
    console.log('Streaming завершен, всего chunks:', totalChunks);
  } catch (error) {
    console.error('Ошибка при вызове Ollama:', error);
    throw error;
  }
}
