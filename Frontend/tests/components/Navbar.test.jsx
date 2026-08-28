import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../../src/components/Navbar";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/dashboard" }),
}));

describe("Navbar Component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renders Navbar correctly", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText("Noted.")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("handles logout correctly", () => {
    localStorage.setItem("token", "test-token");
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    expect(localStorage.getItem("token")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
