import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "../../src/pages/Profile";
import api from "../../src/utils/api";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../src/utils/api", () => ({
  get: jest.fn(),
  put: jest.fn(),
}));

describe("Profile Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("redirects to login if no token", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("fetches and displays user profile", async () => {
    localStorage.setItem("token", "fake-token");
    api.get.mockResolvedValueOnce({ data: { username: "testuser" } });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });
  });

  test("handles logout", async () => {
    localStorage.setItem("token", "fake-token");
    api.get.mockResolvedValueOnce({ data: { username: "testuser" } });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("testuser"));

    fireEvent.click(document.getElementById("logout-btn"));
    expect(localStorage.getItem("token")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("updates password successfully", async () => {
    localStorage.setItem("token", "fake-token");
    api.get.mockResolvedValueOnce({ data: { username: "testuser" } });
    api.put.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("testuser"));

    fireEvent.change(screen.getByLabelText("Current Password"), { target: { value: "OldPass123!" } });
    fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "NewPass123!" } });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "NewPass123!" } });

    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/auth/change-password", {
        currentPassword: "OldPass123!",
        newPassword: "NewPass123!"
      });
      expect(screen.getByText("Password updated successfully.")).toBeInTheDocument();
    });
  });
  test("shows error when fetching profile fails", async () => {
    localStorage.setItem("token", "fake-token");
    api.get.mockRejectedValueOnce({ response: { data: { message: "Fetch failed" } } });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Fetch failed")).toBeInTheDocument();
    });
  });

  test("shows error when new passwords do not match", async () => {
    localStorage.setItem("token", "fake-token");
    api.get.mockResolvedValueOnce({ data: { username: "testuser" } });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("testuser"));

    fireEvent.change(screen.getByLabelText("Current Password"), { target: { value: "OldPass123!" } });
    fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "NewPass123!" } });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "Different123!" } });

    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));

    expect(screen.getByText("New passwords do not match.")).toBeInTheDocument();
  });

  test("shows error when password update API call fails", async () => {
    localStorage.setItem("token", "fake-token");
    api.get.mockResolvedValueOnce({ data: { username: "testuser" } });
    api.put.mockRejectedValueOnce({ response: { data: { message: "Wrong current password" } } });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("testuser"));

    fireEvent.change(screen.getByLabelText("Current Password"), { target: { value: "WrongPass123!" } });
    fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "NewPass123!" } });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "NewPass123!" } });

    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));

    await waitFor(() => {
      expect(screen.getByText("Wrong current password")).toBeInTheDocument();
    });
  });

  test("shows generic error when password update fails with no message", async () => {
    localStorage.setItem("token", "fake-token");
    api.get.mockResolvedValueOnce({ data: { username: "testuser" } });
    api.put.mockRejectedValueOnce({});

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("testuser"));

    fireEvent.change(screen.getByLabelText("Current Password"), { target: { value: "OldPass123!" } });
    fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "NewPass123!" } });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), { target: { value: "NewPass123!" } });

    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));

    await waitFor(() => {
      expect(screen.getByText("Failed to update password.")).toBeInTheDocument();
    });
  });
});
