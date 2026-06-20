import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const API = import.meta.env.VITE_API_URL;

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const getNotes = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API}/notes`);

      setNotes(response.data);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNotes();
  }, []);

const addNote = async () => {

  if (!title.trim()) {
    setError("Title is required");
    return;
  }

  if (title.trim().length < 3) {
    setError("Title must be at least 3 characters");
    return;
  }

  if (!description.trim()) {
    setError("Description is required");
    return;
  }

  if (description.trim().length < 5) {
    setError("Description must be at least 5 characters");
    return;
  }

  try {
    setError("");

    await axios.post(`${API}/notes`, {
      title,
      description,
    });

    setTitle("");
    setDescription("");

    getNotes();

  } catch (err) {

    if (err.response?.status === 422) {
      setError("Validation failed");
      return;
    }

    setError("Failed to add note");
  }
};

  const editNote = (note) => {
    setEditingId(note._id);
    setTitle(note.title);
    setDescription(note.description);
  };

  const updateNote = async () => {

  if (!title.trim()) {
    setError("Title is required");
    return;
  }

  if (title.trim().length < 3) {
    setError("Title must be at least 3 characters");
    return;
  }

  if (!description.trim()) {
    setError("Description is required");
    return;
  }

  if (description.trim().length < 5) {
    setError("Description must be at least 5 characters");
    return;
  }

  try {

    setError("");

    await axios.put(
      `${API}/notes/${editingId}`,
      {
        title,
        description
      }
    );

    setEditingId(null);
    setTitle("");
    setDescription("");

    getNotes();

  } catch (err) {

    if (err.response?.data?.detail) {

      setError(
        err.response.data.detail[0].msg
      );

      return;
    }

    setError("Failed to update note");
  }
};
  const deleteNote = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API}/notes/${id}`);

      getNotes();
    } catch (err) {
      console.log(err);
      setError("Failed to delete note");
    }
  };

  return (
    <div className="container">
      <h1 className="heading">FastAPI Notes App</h1>

      {error && (
        <p style={{ color: "red", marginBottom: "10px" }}>
          {error}
        </p>
      )}

      <input
        className="input"
        type="text"
        placeholder="Enter Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="input"
        type="text"
        placeholder="Enter Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        className="btn"
        onClick={
          editingId
            ? updateNote
            : addNote
        }
      >
        {editingId
          ? "Update Note"
          : "Add Note"}
      </button>

      {editingId && (
        <button
          className="cancel"
          onClick={() => {
            setEditingId(null);
            setTitle("");
            setDescription("");
          }}
        >
          Cancel Edit
        </button>
      )}

      {loading ? (
        <h3 style={{ marginTop: "20px" }}>
          Loading...
        </h3>
      ) : notes.length === 0 ? (
        <h3 style={{ marginTop: "20px" }}>
          No notes found. Create your first note.
        </h3>
      ) : (
        notes.map((note) => (
          <div className="card" key={note._id}>
            <h3>{note.title}</h3>

            <p>{note.description}</p>

            <div className="actions">
              <button
                className="edit"
                onClick={() => editNote(note)}
              >
                Edit
              </button>

              <button
                className="delete"
                onClick={() => deleteNote(note._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default App;