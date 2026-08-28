import React from "react";
import { render } from "@testing-library/react";
import App from "../src/App";

jest.mock("../src/pages/Login", () => () => <div data-testid="login-page">Login Page</div>);
jest.mock("../src/pages/Signup", () => () => <div data-testid="signup-page">Signup Page</div>);
jest.mock("../src/pages/Dashboard", () => () => <div data-testid="dashboard-page">Dashboard Page</div>);
jest.mock("../src/pages/Profile", () => () => <div data-testid="profile-page">Profile Page</div>);

describe("App Component", () => {
  test("renders without crashing", () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId("login-page")).toBeInTheDocument();
  });
});
