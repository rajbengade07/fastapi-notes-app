from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId

from database import notes_collection
from models import Note

from langchain_service import summarize_note
from rag_service import rag_answer


app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://fastapi-notes-app-bay.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- HOME ----------------
@app.get("/")
def home():
    return {"message": "FastAPI Running"}

# ======================================================
# 🟢 1. AI SUMMARIZATION FEATURE (LLM)
# ======================================================

@app.post("/ai/summarize")
def summarize(data: dict):

    title = data["title"]
    description = data["description"]

    text = f"{title}\n{description}"

    result = summarize_note(text)

    return {
        "summary": result
    }


# ======================================================
# 🔵 2. RAG SEARCH FEATURE (MongoDB + LLM)
# ======================================================

@app.post("/ai/search")
def search_notes(data: dict):

    query = data["query"]

    result = rag_answer(query, notes_collection)

    return {
        "answer": result
    }


# ======================================================
# CRUD OPERATIONS (YOUR EXISTING CODE)
# ======================================================

@app.post("/notes")
def create_note(note: Note):

    result = notes_collection.insert_one({
        "title": note.title,
        "description": note.description
    })

    return {
        "message": "Created",
        "id": str(result.inserted_id)
    }


@app.get("/notes")
def get_notes():

    notes = []

    for note in notes_collection.find():
        note["_id"] = str(note["_id"])
        notes.append(note)

    return notes


@app.get("/notes/{id}")
def get_note(id: str):

    note = notes_collection.find_one({"_id": ObjectId(id)})
    note["_id"] = str(note["_id"])

    return note


@app.put("/notes/{id}")
def update_note(id: str, note: Note):

    notes_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "title": note.title,
            "description": note.description
        }}
    )

    return {"message": "Updated"}


@app.delete("/notes/{id}")
def delete_note(id: str):

    notes_collection.delete_one({"_id": ObjectId(id)})

    return {"message": "Deleted"}