import os
import chromadb
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader
from dotenv import load_dotenv

load_dotenv()

DOCS_FOLDER = "./docs"
DB_PATH = "./chroma_db"
COLLECTION_NAME = "rubber_knowledge"

print("Loading embedding model...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.PersistentClient(path=DB_PATH)
collection = client.get_or_create_collection(COLLECTION_NAME)

def extract_pdf_text(filepath):
    reader = PdfReader(filepath)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def chunk_text(text, chunk_size=500, overlap=50):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk:
            chunks.append(chunk)
    return chunks

all_chunks = []
all_ids = []
chunk_index = 0

for filename in os.listdir(DOCS_FOLDER):
    filepath = os.path.join(DOCS_FOLDER, filename)
    print(f"Processing: {filename}")

    if filename.endswith(".pdf"):
        text = extract_pdf_text(filepath)
    elif filename.endswith(".txt"):
        with open(filepath, "r", encoding="utf-8") as f:
            text = f.read()
    else:
        print(f"  Skipping: {filename}")
        continue

    chunks = chunk_text(text)
    for chunk in chunks:
        all_chunks.append(chunk)
        all_ids.append(f"chunk_{chunk_index}")
        chunk_index += 1

print(f"\nTotal chunks created: {len(all_chunks)}")

print("Embedding and storing in ChromaDB...")
embeddings = embedder.encode(all_chunks, show_progress_bar=True).tolist()

collection.add(
    documents=all_chunks,
    embeddings=embeddings,
    ids=all_ids
)

print("Done! Knowledge base is ready.")