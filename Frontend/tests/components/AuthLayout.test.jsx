import React from "react";
import { render, screen } from "@testing-library/react";
import AuthLayout from "../../src/components/AuthLayout";

jest.mock("../../src/assets/waves.svg", () => "waves.svg");

describe("AuthLayout Component", () => {
  test("renders title and subtitle", () => {
    render(
      <AuthLayout title="Test Title" subtitle="Test Subtitle" error="">
        <p>Child Content</p>
      </AuthLayout>
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
  });

  test("renders children inside layout", () => {
    render(
      <AuthLayout title="Title" subtitle="Subtitle" error="">
        <button>Submit</button>
      </AuthLayout>
    );
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  test("renders error message when error prop is provided", () => {
    render(
      <AuthLayout title="Title" subtitle="Subtitle" error="Something went wrong">
        <p>Content</p>
      </AuthLayout>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  test("does not render error div when error is empty", () => {
    render(
      <AuthLayout title="Title" subtitle="Subtitle" error="">
        <p>Content</p>
      </AuthLayout>
    );
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  test("renders brand name Noted.", () => {
    render(
      <AuthLayout title="Title" subtitle="Subtitle" error="">
        <p>Content</p>
      </AuthLayout>
    );
    expect(screen.getByText("Noted.")).toBeInTheDocument();
  });
});
