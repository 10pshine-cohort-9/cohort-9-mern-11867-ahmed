import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../../src/pages/Login";
import api from "../../src/utils/api";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../src/utils/api", () => ({
  post: jest.fn(),
}));

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders Login page correctly", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Login Page" })).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  test("updates form fields correctly", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("password123");
  });

  test("submits form successfully", async () => {
    api.post.mockResolvedValueOnce({ data: { token: "fake-token" } });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        username: "testuser",
        password: "password123",
      });
      expect(localStorage.getItem("token")).toBe("fake-token");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("displays error on failed login", async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "wronguser" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrongpass" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });
});
