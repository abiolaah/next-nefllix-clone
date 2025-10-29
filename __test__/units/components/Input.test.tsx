import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Input from "@/components/Input";
import "@testing-library/jest-dom";

// Test suite for Input component
describe("Input Component", () => {
  // Mock function for onChange
  const mockOnChange = jest.fn();

  // Clear mock function before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test case to check if the component renders with correct label and value
  it("renders with correct label and value", () => {
    render(
      <Input
        id="email"
        value="test@example.com"
        label="Email"
        type="email"
        onChange={mockOnChange}
      />
    );

    // Check if the label and value is rendered
    expect(screen.getByLabelText("Email")).toHaveValue("test@example.com");
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
  });

  // Test case to check if the onChange function is called when input value changes
  it("calls onChange when input value changes", () => {
    let capturedValue = "";

    const handleChange = jest.fn((event) => {
      capturedValue = event.target.value;
    });
    render(
      <Input
        id="onChangeTest"
        value=""
        label="Change Value"
        type="text"
        onChange={handleChange}
      />
    );

    // Get the input element
    const input = screen.getByLabelText("Change Value");

    // Simulate change event
    fireEvent.change(input, { target: { value: "Test Change" } });

    // Check if the mock function is called
    expect(handleChange).toHaveBeenCalled();

    // Check if the captured value is correct
    expect(capturedValue).toBe("Test Change");
  });

  // Test case to check application of custom className(style) provided
  it("applies custom className when provided", () => {
    render(
      <Input
        id="customClassTest"
        value=""
        label="Custom Class"
        type="text"
        onChange={mockOnChange}
        className="custom-input-class"
      />
    );
    // Get the input element
    const input = screen.getByLabelText("Custom Class");

    // Check if the custom class is applied
    expect(input).toHaveClass("custom-input-class");
  });
});
