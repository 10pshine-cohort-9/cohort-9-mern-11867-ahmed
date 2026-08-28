import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NoteEditor from "../../src/components/NoteEditor";
import api from "../../src/utils/api";

jest.mock("quill", () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    clipboard: { dangerouslyPasteHTML: jest.fn() },
    root: { innerHTML: "<p>Mock Content</p>" },
  }));
});

jest.mock("../../src/utils/api", () => ({
  post: jest.fn(),
  put: jest.fn(),
}));

describe("NoteEditor Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly for new note", () => {
    render(<NoteEditor onSave={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByText("New Note")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Note title")).toBeInTheDocument();
  });

  test("renders correctly for editing note", () => {
    const note = { _id: "1", title: "Edit Me", content: "<p>Content</p>" };
    render(<NoteEditor note={note} onSave={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByText("Edit Note")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Edit Me")).toBeInTheDocument();
  });

  test("shows error if title is empty on save", () => {
    render(<NoteEditor onSave={jest.fn()} onCancel={jest.fn()} />);
    fireEvent.submit(screen.getByText("Save Note").closest("form"));
    expect(screen.getByText("Title is required.")).toBeInTheDocument();
  });

  test("calls onCancel when cancel clicked", () => {
    const onCancel = jest.fn();
    render(<NoteEditor onSave={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  test("saves new note successfully", async () => {
    const onSave = jest.fn();
    api.post.mockResolvedValueOnce({ data: { _id: "2", title: "New", content: "<p>Mock Content</p>" } });

    render(<NoteEditor onSave={onSave} onCancel={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Note title"), { target: { value: "New Title" } });
    fireEvent.click(screen.getByText("Save Note"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/notes", { title: "New Title", content: "<p>Mock Content</p>" });
      expect(onSave).toHaveBeenCalled();
    });
  });

  test("updates existing note successfully", async () => {
    const onSave = jest.fn();
    const note = { _id: "1", title: "Old Title", content: "<p>Old Content</p>" };
    api.put.mockResolvedValueOnce({ data: { _id: "1", title: "Updated", content: "<p>Mock Content</p>" } });

    render(<NoteEditor note={note} onSave={onSave} onCancel={jest.fn()} />);
    fireEvent.click(screen.getByText("Save Note"));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/notes/1", { title: "Old Title", content: "<p>Mock Content</p>" });
      expect(onSave).toHaveBeenCalled();
    });
  });
});
