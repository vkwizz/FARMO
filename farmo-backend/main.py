import os
import chromadb
from datetime import datetime
from groq import Groq
from sentence_transformers import SentenceTransformer
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

DB_PATH = "./chroma_db"
COLLECTION_NAME = "rubber_knowledge"

app = FastAPI(title="FARMO IoT & Advisory Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- IoT DATA STORAGE (In-Memory) ---
latest_data = {
    "soil": 0,
    "light": 0,
    "humidity": 0,
    "temperature": 0,
    "time": "No data yet"
}

class SensorData(BaseModel):
    soil: int = Field(..., example=65)
    light: int = Field(..., example=72)
    humidity: float = Field(..., example=80.0)
    temperature: float = Field(..., example=29.0)

embedder = SentenceTransformer("all-MiniLM-L6-v2")
chroma_client = chromadb.PersistentClient(path=DB_PATH)
collection = chroma_client.get_collection(COLLECTION_NAME)

# Using the Groq Key from environment variables
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    # Fallback or error if not found (don't hardcode here)
    pass
groq_client = Groq(api_key=GROQ_API_KEY)

class ChatRequest(BaseModel):
    message: str
    image_finding: str = None

def retrieve_context(query: str, top_k: int = 4) -> tuple[str, list[str]]:
    query_embedding = embedder.encode([query]).tolist()
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k
    )
    context = "\n\n".join(results["documents"][0])
    sources = results["ids"][0]
    return context, sources

@app.post("/iot")
async def receive_iot(data: SensorData):
    global latest_data
    latest_data = data.dict()
    latest_data["time"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"📡 IoT Update: {latest_data}")
    return {"status": "data received"}

@app.get("/data")
async def get_data():
    return latest_data

@app.post("/chat")
def chat(req: ChatRequest):
    try:
        context, sources = retrieve_context(req.message)

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

        return {
            "answer": response.choices[0].message.content,
            "sources": sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def root():
    return {"status": "FARMO Rubber Plantation Chatbot is running"}

if __name__ == "__main__":
    import uvicorn
    # Use port 10000 for consistency with Render deployment and Local Access
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))