import React from "react";
import DOMPurify from "dompurify";
import { LuX, LuPencil } from "react-icons/lu";

const NoteViewer = ({ note, onClose, onEdit }) => {
  const safeHTML = DOMPurify.sanitize(note.content || "");

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="editor-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="View Note"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="editor-modal editor-modal--wide viewer-modal">
        <div className="editor-header">
          <div className="viewer-meta">
            <h2 className="viewer-title">{note.title || "Untitled"}</h2>
            <span className="note-card-date viewer-date">
              {formatDate(note.updatedAt || note.createdAt)}
            </span>
          </div>
          <div className="viewer-header-actions">
            <button
              id="viewer-edit-btn"
              className="editor-close"
              onClick={onEdit}
              aria-label="Edit note"
              type="button"
            >
              <LuPencil size={16} />
            </button>
            <button
              id="viewer-close-btn"
              className="editor-close"
              onClick={onClose}
              aria-label="Close"
              type="button"
            >
              <LuX size={18} />
            </button>
          </div>
        </div>

        <div
          className="viewer-content ql-editor"
          dangerouslySetInnerHTML={{ __html: safeHTML }}
        />
      </div>
    </div>
  );
};

export default NoteViewer;
