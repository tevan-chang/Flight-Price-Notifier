import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import App from "@/App";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App routing", () => {
  it("renders the landing page for /", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Flight Price");
  });

  it("renders the sign-in form for /sign-in", () => {
    renderAt("/sign-in");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Sign in");
  });

  it("renders the sign-up form for /sign-up", () => {
    renderAt("/sign-up");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Sign up");
  });

  it("renders not found for unknown paths", () => {
    renderAt("/nope");
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
