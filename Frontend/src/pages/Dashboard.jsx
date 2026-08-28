import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import NoteEditor from "../components/NoteEditor";
import NoteViewer from "../components/NoteViewer";
import wavesSvg from "../assets/waves.svg";
import { LuPlus, LuTrash2, LuPencil, LuFileText, LuSearch, LuArrowDown, LuArrowUp } from "react-icons/lu";

const getPlainPreview = (html, maxLen = 120) => {
  const plain = DOMPurify.sanitize(html || "", { ALLOWED_TAGS: [] });
  return plain.length > maxLen ? plain.slice(0, maxLen) + "\u2026" : plain || "No content.";
};

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [viewerNote, setViewerNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const navigate = useNavigate();

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/notes");
      setNotes(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchNotes();
  }, [navigate, fetchNotes]);

  const handleNewNote = () => {
    setSelectedNote(null);
    setEditorOpen(true);
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setEditorOpen(true);
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete note.");
    }
  };

  const handleEditorSave = (savedNote, isNew) => {
    if (isNew) {
      setNotes((prev) => [savedNote, ...prev]);
    } else {
      setNotes((prev) =>
        prev.map((n) => (n._id === savedNote._id ? savedNote : n))
      );
    }
    setEditorOpen(false);
    setViewerNote(null);
  };

  const handleViewNote = (note) => {
    setViewerNote(note);
  };

  const handleEditFromViewer = () => {
    setEditorOpen(true);
    setSelectedNote(viewerNote);
    setViewerNote(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredAndSortedNotes = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let result = notes;
    if (term) {
      result = result.filter((note) =>
        note.title ? note.title.toLowerCase().includes(term) : false
      );
    }
    
    return [...result].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [notes, searchTerm, sortOrder]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-waves" aria-hidden="true">
        <img src={wavesSvg} alt="" className="waves-img" />
      </div>
      <Navbar />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">My Notes</h1>
            <p className="dashboard-subtitle">
              {notes.length === 0
                ? "No notes yet."
                : `${notes.length} note${notes.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            id="create-note-btn"
            type="button"
            className="btn-primary dashboard-new-btn"
            onClick={handleNewNote}
          >
            <LuPlus size={18} />
            New Note
          </button>
        </div>

        {notes.length > 0 && (
          <div className="dashboard-controls">
            <div className="search-bar">
              <LuSearch className="search-icon" size={18} />
              <input
                id="search-notes-input"
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                aria-label="Search notes"
              />
            </div>
            <button
              type="button"
              className="dashboard-sort-btn"
              onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
              aria-label={`Sort by date: ${sortOrder === "desc" ? "Newest first" : "Oldest first"}`}
            >
              {sortOrder === "desc" ? <LuArrowDown size={16} /> : <LuArrowUp size={16} />}
              <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
            </button>
          </div>
        )}

        {error && <div className="auth-error dashboard-error">{error}</div>}

        {loading ? (
          <div className="dashboard-loading">
            <div className="loading-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">
              <LuFileText size={32} color="#c0c0c0" />
            </div>
            <p className="dashboard-empty-text">
              Start by creating your first note.
            </p>
            <button
              type="button"
              className="btn-primary dashboard-empty-btn"
              onClick={handleNewNote}
            >
              Create Note
            </button>
          </div>
        ) : filteredAndSortedNotes.length === 0 ? (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">
              <LuSearch size={32} color="#c0c0c0" />
            </div>
            <p className="dashboard-empty-text">
              No notes match your search.
            </p>
          </div>
        ) : (
          <div className="notes-grid">
            {filteredAndSortedNotes.map((note) => (
              <article key={note._id} className="note-card">
                <div
                  className="note-card-body note-card-body--clickable"
                  onClick={() => handleViewNote(note)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleViewNote(note)}
                  aria-label={`View note: ${note.title || "Untitled"}`}
                >
                  <h2 className="note-card-title">
                    {note.title || "Untitled"}
                  </h2>
                  <div
                    className="note-card-content"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(note.content || "No content.")
                    }}
                  />
                </div>
                <div className="note-card-footer">
                  <span className="note-card-date">
                    {formatDate(note.updatedAt || note.createdAt)}
                  </span>
                  <div className="note-card-actions">
                    <button
                      id={`edit-note-${note._id}`}
                      type="button"
                      className="note-action-btn"
                      onClick={(e) => { e.stopPropagation(); handleEditNote(note); }}
                      aria-label="Edit note"
                    >
                      <LuPencil size={15} />
                    </button>
                    <button
                      id={`delete-note-${note._id}`}
                      type="button"
                      className="note-action-btn note-action-btn--danger"
                      onClick={(e) => { e.stopPropagation(); handleDeleteNote(note._id); }}
                      aria-label="Delete note"
                    >
                      <LuTrash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {editorOpen && (
        <NoteEditor
          note={selectedNote}
          onSave={handleEditorSave}
          onCancel={() => setEditorOpen(false)}
        />
      )}

      {viewerNote && (
        <NoteViewer
          note={viewerNote}
          onClose={() => setViewerNote(null)}
          onEdit={handleEditFromViewer}
        />
      )}
    </div>
  );
};

export default Dashboard;
