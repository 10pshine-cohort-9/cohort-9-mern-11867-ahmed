import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NoteViewer from "../../src/components/NoteViewer";

describe("NoteViewer Component", () => {
  const mockNote = {
    _id: "1",
    title: "Test Note",
    content: "<p>Test Content</p>",
    updatedAt: "2023-01-01T00:00:00.000Z",
  };

  test("renders correctly", () => {
    const onClose = jest.fn();
    const onEdit = jest.fn();

    render(<NoteViewer note={mockNote} onClose={onClose} onEdit={onEdit} />);

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText("January 1, 2023")).toBeInTheDocument();
  });

  test("calls onClose when close button clicked", () => {
    const onClose = jest.fn();
    render(<NoteViewer note={mockNote} onClose={onClose} onEdit={jest.fn()} />);

    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  test("calls onEdit when edit button clicked", () => {
    const onEdit = jest.fn();
    render(<NoteViewer note={mockNote} onClose={jest.fn()} onEdit={onEdit} />);

    fireEvent.click(screen.getByLabelText("Edit note"));
    expect(onEdit).toHaveBeenCalled();
  });
});
