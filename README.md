# sonnaik
Проект "Сонник" для хакатона Кибер102

Зависимости:
- poetry - пакетный менеджер для Python
- npm - пакетный менеджер для JavaScript
- docker - оркестратор контейнеров
- Python 3.12.10 - язык программирования
- JavaScript - язык программирования

Используемые библиотеки:
Python:
- fastapi
- motor
- uvicorn
- pwdlib
- pyjwt
- python-dotenv
- python-jose
- requests
- ollama
- torch
- silero-stress
- scipy
- websockets

JavaScript:
- vite
- @types/react
- @types/react-dom
- @vitejs/plugin-react
- autoprefixer
- postcss
- tailwindcss

Установка:
```
docker pull alphacep/kaldi-ru:latest
docker run -d -p 2700:2700 alphacep/kaldi-ru:latest
git clone https://github.com/hackathonsrus/Kiber102_lowtab_141/ cyber102
cd cyber102/backend
poetry install
cd src
uvicorn main:api --reload --port 2717
cd ../../frontend2
npm i
npm run dev
```
