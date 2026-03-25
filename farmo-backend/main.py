import os
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables early
load_dotenv()

DB_PATH = "./chroma_db"
COLLECTION_NAME = "rubber_knowledge"

app = FastAPI(title="FARMO IoT & Advisory Engine")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GLOBAL RESOURCE CACHE ---
_resources = {
    "embedder": None,
    "chroma_client": None,
    "collection": None,
    "groq_client": None
}

# --- SAFE RESOURCE LOADER ---
def get_resources():
    global _resources

    # Load embedding model
    if _resources["embedder"] is None:
        try:
            print("⏳ Loading embedding model...")
            from sentence_transformers import SentenceTransformer
            _resources["embedder"] = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            print("❌ Failed to load embedding model:", e)

    # Load ChromaDB
    if _resources["chroma_client"] is None:
        try:
            print("⏳ Connecting to ChromaDB...")
            import chromadb
            _resources["chroma_client"] = chromadb.PersistentClient(path=DB_PATH)

            # Try get collection, else create
            try:
                _resources["collection"] = _resources["chroma_client"].get_collection(COLLECTION_NAME)
            except Exception:
                print("⚠️ Collection not found. Creating new one...")
                _resources["collection"] = _resources["chroma_client"].create_collection(COLLECTION_NAME)

        except Exception as e:
            print("❌ ChromaDB error:", e)

    # Load Groq client
    if _resources["groq_client"] is None:
        try:
            print("⏳ Connecting to Groq...")
            from groq import Groq
            api_key = os.getenv("GROQ_API_KEY")

            if not api_key:
                print("⚠️ GROQ_API_KEY missing. Chat disabled.")
            else:
                _resources["groq_client"] = Groq(api_key=api_key)

        except Exception as e:
            print("❌ Groq init error:", e)

    return _resources


# --- STARTUP CHECK ---
@app.on_event("startup")
async def startup_event():
    print("🚀 FARMO Backend started successfully!")
    print(f"📡 Environment: {'Production' if os.getenv('RENDER') else 'Local'}")


# --- DATA STORAGE ---
latest_data = {
    "soil": 0,
    "light": 0,
    "humidity": 0,
    "temperature": 0,
    "time": "No data yet"
}


# --- MODELS ---
class SensorData(BaseModel):
    soil: int = Field(..., example=65)
    light: int = Field(..., example=72)
    humidity: float = Field(..., example=80.0)
    temperature: float = Field(..., example=29.0)


class ChatRequest(BaseModel):
    message: str
    image_finding: str = None


# --- CONTEXT RETRIEVAL ---
def retrieve_context(query: str, top_k: int = 4):
    try:
        res = get_resources()

        if not res["embedder"] or not res["collection"]:
            return "", []

        query_embedding = res["embedder"].encode([query]).tolist()

        results = res["collection"].query(
            query_embeddings=query_embedding,
            n_results=top_k
        )

        context = "\n\n".join(results["documents"][0])
        sources = results["ids"][0]

        return context, sources

    except Exception as e:
        print("⚠️ Context retrieval error:", e)
        return "", []


# --- ROUTES ---
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
        res = get_resources()

        # Safe context retrieval
        context, sources = retrieve_context(req.message)

        # If Groq not available
        if not res["groq_client"]:
            return {
                "answer": "⚠️ Chat service unavailable (missing API key).",
                "sources": []
            }

        system_prompt = f"""
You are an expert rubber plantation assistant helping farmers.

--- KNOWLEDGE BASE ---
{context}
--- END KNOWLEDGE BASE ---

Give practical and concise advice.
"""

        user_message = req.message
        if req.image_finding:
            user_message = f"{req.image_finding}\n\n{req.message}"

        response = res["groq_client"].chat.completions.create(
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
        print("❌ Chat error:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def root():
    return {"status": "FARMO backend is running successfully"}


# --- LOCAL RUN ---
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)