from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="chatbot-service", version="1.0.0")


@app.get("/health")
def health():
    return {"status": "ok", "service": "chatbot-service"}


@app.post("/chat")
def chat(body: dict):
    # TODO: integrar con Anthropic / OpenAI
    return {"message": "chatbot response - TODO"}
