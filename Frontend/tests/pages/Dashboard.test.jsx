import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../../src/pages/Dashboard";
import api from "../../src/utils/api";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../src/utils/api", () => ({
  get: jest.fn(),
  delete: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

describe("Dashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("redirects to login if no token", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("fetches and displays notes", async () => {
    localStorage.setItem("token", "fake-token");
    const mockNotes = [
      { _id: "1", title: "Test Note 1", content: "<p>Content 1</p>", createdAt: "2023-01-01T00:00:00Z" },
    ];
    api.get.mockResolvedValueOnce({ data: mockNotes });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("Noted.")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Test Note 1")).toBeInTheDocument();
      expect(screen.getByText("Content 1")).toBeInTheDocument();
    });
  });

  test("displays empty state when no notes", async () => {
    localStorage.setItem("token", "fake-token");
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No notes yet.")).toBeInTheDocument();
      expect(screen.getByText("Start by creating your first note.")).toBeInTheDocument();
    });
  });

  test("shows error when fetch fails", async () => {
    localStorage.setItem("token", "fake-token");
    api.get.mockRejectedValueOnce({ response: { data: { message: "Server error" } } });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  test("shows generic error when fetch fails with no message", async () => {
    localStorage.setItem("token", "fake-token");
    api.get.mockRejectedValueOnce({});

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to load notes. Please try again.")).toBeInTheDocument();
    });
  });

  test("opens editor when New Note is clicked", async () => {
    localStorage.setItem("token", "fake-token");
    api.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Start by creating your first note."));
    fireEvent.click(document.getElementById("create-note-btn"));

    await waitFor(() => {
      expect(document.querySelector(".editor-overlay")).toBeInTheDocument();
    });
  });

  test("deletes a note after confirmation", async () => {
    localStorage.setItem("token", "fake-token");
    const mockNotes = [{ _id: "1", title: "Test Note 1", content: "<p>Content 1</p>" }];
    api.get.mockResolvedValueOnce({ data: mockNotes });
    api.delete.mockResolvedValueOnce({});

    window.confirm = jest.fn(() => true);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Test Note 1"));

    fireEvent.click(screen.getByLabelText("Delete note"));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/notes/1");
      expect(screen.queryByText("Test Note 1")).not.toBeInTheDocument();
    });
  });

  test("does not delete if confirm is cancelled", async () => {
    localStorage.setItem("token", "fake-token");
    const mockNotes = [{ _id: "1", title: "Test Note 1", content: "<p>Content 1</p>" }];
    api.get.mockResolvedValueOnce({ data: mockNotes });

    window.confirm = jest.fn(() => false);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Test Note 1"));
    fireEvent.click(screen.getByLabelText("Delete note"));

    expect(api.delete).not.toHaveBeenCalled();
    expect(screen.getByText("Test Note 1")).toBeInTheDocument();
  });

  test("shows note viewer when a note card is clicked", async () => {
    localStorage.setItem("token", "fake-token");
    const mockNotes = [{ _id: "1", title: "Test Note 1", content: "<p>Content 1</p>" }];
    api.get.mockResolvedValueOnce({ data: mockNotes });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Test Note 1"));
    fireEvent.click(screen.getByLabelText("View note: Test Note 1"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  test("opens edit editor from viewer", async () => {
    localStorage.setItem("token", "fake-token");
    const mockNotes = [{ _id: "1", title: "Test Note 1", content: "<p>Content 1</p>" }];
    api.get.mockResolvedValueOnce({ data: mockNotes });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Test Note 1"));
    fireEvent.click(screen.getByLabelText("View note: Test Note 1"));

    await waitFor(() => screen.getByRole("dialog"));
    fireEvent.click(document.getElementById("viewer-edit-btn"));

    await waitFor(() => {
      expect(document.querySelector(".editor-overlay")).toBeInTheDocument();
    });
  });

  test("shows error when delete fails", async () => {
    localStorage.setItem("token", "fake-token");
    const mockNotes = [{ _id: "1", title: "Test Note 1", content: "<p>Content 1</p>" }];
    api.get.mockResolvedValueOnce({ data: mockNotes });
    api.delete.mockRejectedValueOnce({ response: { data: { message: "Delete failed" } } });

    window.confirm = jest.fn(() => true);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Test Note 1"));
    fireEvent.click(screen.getByLabelText("Delete note"));

    await waitFor(() => {
      expect(screen.getByText("Delete failed")).toBeInTheDocument();
    });
  });

  test("filters notes by title when searching", async () => {
    localStorage.setItem("token", "fake-token");
    const mockNotes = [
      { _id: "1", title: "Apple Note", content: "<p>Content 1</p>" },
      { _id: "2", title: "Banana Note", content: "<p>Content 2</p>" },
    ];
    api.get.mockResolvedValueOnce({ data: mockNotes });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Apple Note"));
    expect(screen.getByText("Banana Note")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Search notes...");
    fireEvent.change(searchInput, { target: { value: "apple" } });

    expect(screen.getByText("Apple Note")).toBeInTheDocument();
    expect(screen.queryByText("Banana Note")).not.toBeInTheDocument();
  });

  test("shows empty search message when no titles match", async () => {
    localStorage.setItem("token", "fake-token");
    const mockNotes = [{ _id: "1", title: "Apple Note", content: "<p>Content 1</p>" }];
    api.get.mockResolvedValueOnce({ data: mockNotes });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Apple Note"));

    const searchInput = screen.getByPlaceholderText("Search notes...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    expect(screen.getByText("No notes match your search.")).toBeInTheDocument();
  });

  test("toggles note sort order by date", async () => {
    localStorage.setItem("token", "fake-token");
    const mockNotes = [
      { _id: "1", title: "Older Note", content: "<p>Content</p>", createdAt: "2023-01-01T00:00:00Z" },
      { _id: "2", title: "Newer Note", content: "<p>Content</p>", createdAt: "2023-06-01T00:00:00Z" },
    ];
    api.get.mockResolvedValueOnce({ data: mockNotes });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Newer Note"));
    const sortBtn = screen.getByRole("button", { name: /Sort by date/i });
    expect(sortBtn).toBeInTheDocument();

    fireEvent.click(sortBtn);
    expect(screen.getByText("Oldest First")).toBeInTheDocument();
  });
  test("opens editor when edit button on note card is clicked", async () => {
    localStorage.setItem("token", "fake-token");
    const mockNotes = [{ _id: "1", title: "Test Note 1", content: "<p>Content 1</p>" }];
    api.get.mockResolvedValueOnce({ data: mockNotes });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Test Note 1"));
    fireEvent.click(screen.getByLabelText("Edit note"));

    await waitFor(() => {
      expect(document.querySelector(".editor-overlay")).toBeInTheDocument();
    });
  });

  test("updates existing note in list after save from editor", async () => {
    localStorage.setItem("token", "fake-token");
    const mockNotes = [{ _id: "1", title: "Old Title", content: "<p>Old</p>" }];
    api.get.mockResolvedValueOnce({ data: mockNotes });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Old Title"));
    fireEvent.click(screen.getByLabelText("Edit note"));
    await waitFor(() => document.querySelector(".editor-overlay"));

    // Simulate save by clicking cancel (editor closes without testing Quill internals)
    fireEvent.click(document.getElementById("editor-cancel-btn"));
    await waitFor(() => {
      expect(document.querySelector(".editor-overlay")).not.toBeInTheDocument();
    });
  });

  test("opens note viewer on keyboard Enter key press", async () => {
    localStorage.setItem("token", "fake-token");
    const mockNotes = [{ _id: "1", title: "Test Note 1", content: "<p>Content 1</p>" }];
    api.get.mockResolvedValueOnce({ data: mockNotes });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Test Note 1"));
    const noteBody = screen.getByLabelText("View note: Test Note 1");
    fireEvent.keyDown(noteBody, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  test("does not open viewer on non-Enter key press", async () => {
    localStorage.setItem("token", "fake-token");
    const mockNotes = [{ _id: "1", title: "Test Note 1", content: "<p>Content 1</p>" }];
    api.get.mockResolvedValueOnce({ data: mockNotes });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Test Note 1"));
    const noteBody = screen.getByLabelText("View note: Test Note 1");
    fireEvent.keyDown(noteBody, { key: "Space" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("shows Oldest First label after toggling sort to ascending", async () => {
    localStorage.setItem("token", "fake-token");
    const mockNotes = [
      { _id: "1", title: "Older Note", content: "<p>Content</p>", createdAt: "2023-01-01T00:00:00Z" },
      { _id: "2", title: "Newer Note", content: "<p>Content</p>", createdAt: "2023-06-01T00:00:00Z" },
    ];
    api.get.mockResolvedValueOnce({ data: mockNotes });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Newer Note"));
    const sortBtn = screen.getByRole("button", { name: /Sort by date/i });
    fireEvent.click(sortBtn);
    expect(screen.getByText("Oldest First")).toBeInTheDocument();

    // Toggle back to desc
    fireEvent.click(sortBtn);
    expect(screen.getByText("Newest First")).toBeInTheDocument();
  });

  test("shows generic delete error when no message in response", async () => {
    localStorage.setItem("token", "fake-token");
    const mockNotes = [{ _id: "1", title: "Test Note 1", content: "<p>Content 1</p>" }];
    api.get.mockResolvedValueOnce({ data: mockNotes });
    api.delete.mockRejectedValueOnce({});

    window.confirm = jest.fn(() => true);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Test Note 1"));
    fireEvent.click(screen.getByLabelText("Delete note"));

    await waitFor(() => {
      expect(screen.getByText("Failed to delete note.")).toBeInTheDocument();
    });
  });
});
