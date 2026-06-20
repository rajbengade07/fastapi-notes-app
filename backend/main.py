from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from bson import ObjectId

from database import notes_collection
from models import Note

from pydantic import BaseModel, Field

class Note(BaseModel):
    title: str = Field(
        min_length=3,
        max_length=100
    )

    description: str = Field(
        min_length=5,
        max_length=500
    )

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "FastAPI Running"
    }


# CREATE

@app.post("/notes")
def create_note(note: Note):

    result = notes_collection.insert_one(
        {
            "title": note.title,
            "description": note.description
        }
    )

    return {
        "message": "Created",
        "id": str(result.inserted_id)
    }


# READ ALL

@app.get("/notes")
def get_notes():

    notes = []

    for note in notes_collection.find():

        note["_id"] = str(note["_id"])

        notes.append(note)

    return notes


# READ ONE

@app.get("/notes/{id}")
def get_note(id: str):

    note = notes_collection.find_one(
        {
            "_id": ObjectId(id)
        }
    )

    note["_id"] = str(note["_id"])

    return note


# UPDATE

@app.put("/notes/{id}")
def update_note(id: str, note: Note):

    notes_collection.update_one(
        {
            "_id": ObjectId(id)
        },
        {
            "$set": {
                "title": note.title,
                "description": note.description
            }
        }
    )

    return {
        "message": "Updated"
    }


# DELETE

@app.delete("/notes/{id}")
def delete_note(id: str):

    notes_collection.delete_one(
        {
            "_id": ObjectId(id)
        }
    )

    return {
        "message": "Deleted"
    }