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
});
