import os
import chromadb
from groq import Groq
from sentence_transformers import SentenceTransformer
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

DB_PATH = "./chroma_db"
COLLECTION_NAME = "rubber_knowledge"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

embedder = SentenceTransformer("all-MiniLM-L6-v2")
chroma_client = chromadb.PersistentClient(path=DB_PATH)
collection = chroma_client.get_collection(COLLECTION_NAME)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class ChatRequest(BaseModel):
    message: str
    image_finding: str = None

def retrieve_context(query: str, top_k: int = 4) -> str:
    query_embedding = embedder.encode([query]).tolist()
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k
    )
    return "\n\n".join(results["documents"][0])

@app.post("/chat")
def chat(req: ChatRequest):
    context = retrieve_context(req.message)

    system_prompt = f"""You are an expert rubber plantation assistant helping farmers.
You specialize in rubber plant diseases, treatments, tapping practices, and seasonal care.

Use the following knowledge base to answer accurately:

--- KNOWLEDGE BASE ---
{context}
--- END KNOWLEDGE BASE ---

Guidelines:
- Give practical farmer-friendly advice
- If a disease is detected via image, prioritize that in your response
- If the answer is not in the knowledge base, say so clearly
- Keep responses concise and actionable"""

    user_message = req.message
    if req.image_finding:
        user_message = f"Image analysis detected: {req.image_finding}\n\nFarmer's question: {req.message}"

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        temperature=0.3
    )

    return {"answer": response.choices[0].message.content}

@app.get("/")
def root():
    return {"status": "Rubber Plantation Chatbot is running"}