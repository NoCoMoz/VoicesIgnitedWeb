import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./Button";
import "@testing-library/jest-dom";

const mockOnClick = jest.fn();

describe("Button Component", () => {
  test("renders text on button", () => {
    render(<Button text={"Submit"} />);

    const button = screen.getByRole("button", { name: "Submit" });

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Submit");
  });

  test("Button calles onClick when called", () => {
    render(<Button text={"Submit"} onClick={mockOnClick} />);

    const button = screen.getByRole("button", { name: "Submit" });

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);

  });
});
