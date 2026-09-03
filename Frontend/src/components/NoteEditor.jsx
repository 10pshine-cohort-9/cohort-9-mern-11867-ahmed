import React, { useState, useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import DOMPurify from "dompurify";
import api from "../utils/api";
import { LuX } from "react-icons/lu";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  ["link"],
  ["clean"],
];

const NoteEditor = ({ note, onSave, onCancel }) => {
  const isNew = !note;
  const [title, setTitle] = useState(note?.title || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const initialContent = useRef(note?.content || "");

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Write your note here...",
        modules: { toolbar: TOOLBAR_OPTIONS },
      });

      if (initialContent.current) {
        quillRef.current.clipboard.dangerouslyPasteHTML(
          DOMPurify.sanitize(initialContent.current)
        );
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      return setError("Title is required.");
    }
    const rawHTML = quillRef.current ? quillRef.current.root.innerHTML : "";
    const cleanHTML = DOMPurify.sanitize(rawHTML);
    const isEmpty =
      !cleanHTML || cleanHTML === "<p><br></p>" || cleanHTML.trim() === "";
    if (isEmpty) {
      return setError("Content is required.");
    }
    setLoading(true);
    try {
      let res;
      if (isNew) {
        res = await api.post("/notes", { title: title.trim(), content: cleanHTML });
      } else {
        res = await api.put(`/notes/${note._id}`, { title: title.trim(), content: cleanHTML });
      }
      onSave(res.data, isNew);
    } catch {
      setError("Failed to save note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor-overlay" role="dialog" aria-modal="true" aria-label="Note Editor">
      <div className="editor-modal editor-modal--wide">
        <div className="editor-header">
          <h2 className="editor-heading">{isNew ? "New Note" : "Edit Note"}</h2>
          <button
            id="editor-close-btn"
            className="editor-close"
            onClick={onCancel}
            aria-label="Close editor"
            type="button"
          >
            <LuX size={18} />
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="editor-form">
          <div className="form-field">
            <label htmlFor="note-title" className="editor-label">Title</label>
            <input
              id="note-title"
              type="text"
              className="form-input"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="note-content-editor" className="editor-label">Content</label>
            <div className="quill-wrapper">
              <div id="note-content-editor" ref={editorRef} />
            </div>
          </div>

          <div className="editor-actions">
            <button
              id="editor-cancel-btn"
              type="button"
              className="btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              id="editor-save-btn"
              type="submit"
              className="btn-primary editor-save-btn"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteEditor;
