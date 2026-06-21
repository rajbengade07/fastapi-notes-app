import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const API = import.meta.env.VITE_API_URL;

  // ---------------- STATES ----------------
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [summary, setSummary] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");

  // ---------------- FETCH NOTES ----------------
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

  // ---------------- ADD NOTE ----------------
  const addNote = async () => {
    if (!title.trim() || title.trim().length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
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
      setError("Failed to add note");
    }
  };

  // ---------------- UPDATE NOTE ----------------
  const updateNote = async () => {
    try {
      setError("");

      await axios.put(`${API}/notes/${editingId}`, {
        title,
        description,
      });

      setEditingId(null);
      setTitle("");
      setDescription("");
      getNotes();
    } catch (err) {
      setError("Failed to update note");
    }
  };

  // ---------------- DELETE NOTE ----------------
  const deleteNote = async (id) => {
    const confirmDelete = window.confirm("Delete this note?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API}/notes/${id}`);
      getNotes();
    } catch (err) {
      setError("Failed to delete note");
    }
  };

  // ---------------- EDIT NOTE ----------------
  const editNote = (note) => {
    setEditingId(note._id);
    setTitle(note.title);
    setDescription(note.description);
  };

  // ---------------- AI SUMMARIZE ----------------
  const summarizeNote = async (note) => {
    try {
      const res = await axios.post(`${API}/ai/summarize`, {
        title: note.title,
        description: note.description,
      });

      setSummary(res.data.summary);
    } catch (err) {
      setError("AI Summarization failed");
    }
  };

  // ---------------- RAG SEARCH ----------------
  const askAI = async () => {
    try {
      const res = await axios.post(`${API}/ai/search`, {
        query: aiQuery,
      });

      setAiAnswer(res.data.answer);
    } catch (err) {
      setError("AI Search failed");
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="container">
      <h1 className="heading">FastAPI Notes App 🚀</h1>

      {/* ---------------- AI SEARCH ---------------- */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Ask AI about Notes</h2>

        <input
          className="input"
          type="text"
          placeholder="Ask about your notes..."
          value={aiQuery}
          onChange={(e) => setAiQuery(e.target.value)}
        />

        <button className="btn" onClick={askAI}>
          Ask AI
        </button>

  
      </div>

      {/* ---------------- ERROR ---------------- */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ---------------- INPUT FORM ---------------- */}
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
        onClick={editingId ? updateNote : addNote}
      >
        {editingId ? "Update Note" : "Add Note"}
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

      {/* ---------------- LOADING ---------------- */}
      {loading && <h3>Loading...</h3>}

      {/* ---------------- NOTES ---------------- */}
      {!loading && notes.length === 0 && (
        <h3>No notes found</h3>
      )}

      {notes.map((note) => (
        <div className="card" key={note._id}>
          <h3>{note.title}</h3>
          <p>{note.description}</p>

          <div className="actions">
            <button className="edit" onClick={() => editNote(note)}>
              Edit
            </button>

            <button
              className="ai"
              onClick={() => summarizeNote(note)}
            >
              Summarize AI
            </button>

            <button
              className="delete"
              onClick={() => deleteNote(note._id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* ---------------- SUMMARY OUTPUT ---------------- */}
                  {summary && (
                      <div className="summary-box">
                        <h3>✨ AI Summary</h3>
                        <p>{summary}</p>
                      </div>
                    )}
                    {aiAnswer && (
  <div className="answer-box">
    <h3>🤖 AI Answer</h3>
    <p>{aiAnswer}</p>
  </div>
)}

      
    </div>
  );
}

export default App;