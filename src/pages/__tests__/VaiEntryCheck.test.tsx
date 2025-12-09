import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, beforeEach, expect, vi } from "vitest";
import VaiEntryCheck from "../VaiEntryCheck";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("VaiEntryCheck", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("shows warning and navigates to contact collection for new users", () => {
    render(<VaiEntryCheck />);

    fireEvent.click(screen.getByText(/No, I'm new/i));
    expect(
      screen.getByText(/Duplicate V.A.I. attempts are automatically rejected/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText(/I Understand, Continue/i));
    expect(mockNavigate).toHaveBeenCalledWith("/vai-contact");
  });

  it("navigates existing users directly to existing flow", () => {
    render(<VaiEntryCheck />);

    fireEvent.click(screen.getByText(/Yes, I already have one/i));
    expect(mockNavigate).toHaveBeenCalledWith("/existing-vai");
  });
});
