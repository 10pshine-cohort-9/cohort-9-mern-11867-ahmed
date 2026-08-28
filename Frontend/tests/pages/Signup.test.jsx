import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Signup from "../../src/pages/Signup";
import api from "../../src/utils/api";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../src/utils/api", () => ({
  post: jest.fn(),
}));

describe("Signup Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("renders Signup page correctly", () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Sign Up" })).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  test("shows error if username is invalid", () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "ab" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "ValidPass123!" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "ValidPass123!" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(screen.getByText(/Username must be 3-20 characters/i)).toBeInTheDocument();
  });

  test("shows error if password is invalid", () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "valid_user" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "weakpass" } }); 
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "weakpass" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
  });

  test("shows error if passwords do not match", () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "valid_user" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "ValidPass123!" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "ValidPass123!_different" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
  });

  test("submits form successfully", async () => {
    api.post.mockResolvedValueOnce({ data: { token: "fake-token" } });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "valid_user" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "ValidPass123!" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "ValidPass123!" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/register", {
        username: "valid_user",
        password: "ValidPass123!",
      });
      expect(localStorage.getItem("token")).toBe("fake-token");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("displays error on failed registration", async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: "User already exists" } },
    });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "valid_user" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "ValidPass123!" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "ValidPass123!" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(screen.getByText("User already exists")).toBeInTheDocument();
    });
  });
});
