import os
import json
from datetime import datetime
from groq import Groq
import chromadb
from sentence_transformers import SentenceTransformer
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FARMO IoT & Advisory Engine")

# Enable CORS for Mobile/Web Client Access
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

# Initialize Groq Client
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
groq_client = Groq(api_key=GROQ_API_KEY)

# Initialize ChromaDB (Local Storage)
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(name="rubber_advisory")

# Embedding Model (Local CPU-friendly model)
embed_model = SentenceTransformer('all-MiniLM-L6-v2')

class ChatRequest(BaseModel):
    query: str

class AdvisoryResponse(BaseModel):
    answer: str
    sources: list[str]

@app.on_event("startup")
async def startup_event():
    # Load advisory documentation on startup for ingestion if needed
    if collection.count() == 0:
        print("📥 Initializing Knowledge Base...")
        try:
            # We look for advisory.json in both app and mobile directories
            advisory_path = "../../farmo-mobile/src/advisory.json"
            if not os.path.exists(advisory_path):
                 advisory_path = "../farmo-mobile/src/advisory.json" # Relative from root
            
            with open(advisory_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            documents = []
            ids = []
            for name, details in data.items():
                content = f"Disease: {name}. Overview: {details['overview']}. Treatment: {'. '.join(details['treatment'])}. Prevention: {'. '.join(details['prevention'])}."
                # Optionally add Malayalam if index is meant for both
                # content += f" Malayalam Treatmend: {details.get('malayalam', '')}"
                
                documents.append(content)
                ids.append(name)
            
            embeddings = embed_model.encode(documents).tolist()
            collection.add(
                documents=documents,
                embeddings=embeddings,
                ids=ids
            )
            print(f"✅ Knowledge Base Loaded: {len(ids)} documents.")
        except Exception as e:
            print(f"❌ Initialization Failed: {e}")

# --- IoT Endpoints ---

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

# --- Existing Chat Endpoint ---

@app.post("/chat", response_model=AdvisoryResponse)
async def chat(request: ChatRequest):
    try:
        # 1. Embed user query
        query_embedding = embed_model.encode([request.query]).tolist()
        
        # 2. Search ChromaDB
        results = collection.query(
            query_embeddings=query_embedding,
            n_results=2
        )
        
        context = "\n\n".join(results['documents'][0])
        sources = results['ids'][0]
        
        # 3. Generate Answer with Groq Cloud (Ultra-Fast Inference)
        prompt = f"""
        You are FARMO Advisory, a specialized AI for rubber farming in Kerala.
        Use the following context extracted from authorized Rubber Board guides to answer the user's question accurately.
        If the question is in Malayalam, answer in Malayalam.
        
        Agricultural Context:
        {context}
        
        Farmer's Question: {request.query}
        
        Answer (provide practical, localized advice):
        """
        
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a specialized agricultural expert for rubber plantations in Kerala."},
                {"role": "user", "content": prompt}
            ],
            model="llama3-70b-8192", # High reasoning model
            temperature=0.7,
            max_tokens=1024
        )
        
        answer = chat_completion.choices[0].message.content
        
        return AdvisoryResponse(
            answer=answer,
            sources=sources
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Use port 10000 for Render deployment
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))
