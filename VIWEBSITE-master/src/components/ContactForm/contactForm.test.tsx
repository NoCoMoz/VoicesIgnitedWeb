import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactForm from "./ContactForm";
import "@testing-library/jest-dom";

jest.mock("../Button/Button", () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <button>{text}</button>,
}));

describe("Contact Form", () => {
  let fetchSpy: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    // Spy on global fetch
    fetchSpy = jest.fn();
    // Attach the mock function to global.fetch
    global.fetch = fetchSpy;
  });

  afterEach(() => {
    // Reset the mock fetch after each test
    jest.resetAllMocks();
  });

  test("renders the form correctly", () => {
    render(<ContactForm />);

    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your message")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  test("shows loading message when submitting", async () => {
    render(<ContactForm />);

    // Mock the fetch request to return a successful response
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValueOnce({ success: true }),
    } as Partial<Response> as Response);

    const submitButton = screen.getByRole("button", { name: /submit/i });

    // Fill out form fields before submitting
    fireEvent.change(
      screen.getByPlaceholderText("Enter your name") as HTMLInputElement,
      { target: { value: "John Doe" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText("Enter your email") as HTMLInputElement,
      { target: { value: "john@example.com" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText("Enter your message") as HTMLTextAreaElement,
      { target: { value: "Hello there!" } }
    );

    // Click submit button
    fireEvent.click(submitButton);

    // Wait for the "Sending...." message
    await waitFor(() =>
      expect(screen.getByText("Sending....")).toBeInTheDocument()
    );
  });

  test("shows Form Submitted Successfully message after sent", async () => {
    render(<ContactForm />);

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValueOnce({ success: true }),
    } as Partial<Response> as Response);

    const submitButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(
      screen.getByPlaceholderText("Enter your name") as HTMLInputElement,
      { target: { value: "John Doe" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText("Enter your email") as HTMLInputElement,
      { target: { value: "john@example.com" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText("Enter your message") as HTMLTextAreaElement,
      { target: { value: "Hello there!" } }
    );

    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(
        screen.getByText("Form Submitted Successfully")
      ).toBeInTheDocument()
    );
  });

  test("shows error message when the submission fails", async () => {
    render(<ContactForm />);

    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: jest.fn().mockResolvedValueOnce({
        success: false,
        message: "Failed to submit",
      }),
    } as Partial<Response> as Response);

    const submitButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(
      screen.getByPlaceholderText("Enter your name") as HTMLInputElement,
      { target: { value: "John Doe" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText("Enter your email") as HTMLInputElement,
      { target: { value: "john@example.com" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText("Enter your message") as HTMLTextAreaElement,
      { target: { value: "Hello there!" } }
    );

    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(screen.getByText("Failed to submit")).toBeInTheDocument()
    );
  });

  test("does not submit the form if fields are empty", () => {
    const { getByText, getByPlaceholderText } = render(<ContactForm />);

    const nameInput = getByPlaceholderText(/enter your name/i) as HTMLInputElement;
    const emailInput = getByPlaceholderText(/enter your email/i) as HTMLInputElement;
    const messageTextarea = getByPlaceholderText(/enter your message/i) as HTMLTextAreaElement;

    fireEvent.click(getByText(/submit/i));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(nameInput).toBeInvalid();
    expect(emailInput).toBeInvalid();
    expect(messageTextarea).toBeInvalid();
  });

  test("form fields reset after successful submission", async () => {
    render(<ContactForm />);

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValueOnce({ success: true }),
    } as Partial<Response> as Response);

    const submitButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(
      screen.getByPlaceholderText("Enter your name") as HTMLInputElement,
      { target: { value: "John Doe" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText("Enter your email") as HTMLInputElement,
      { target: { value: "john@example.com" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText("Enter your message") as HTMLTextAreaElement,
      { target: { value: "Hello there!" } }
    );

    fireEvent.click(submitButton);

    await waitFor(() => expect(screen.getByText("Form Submitted Successfully")).toBeInTheDocument());

    // Check if form has been reset
    expect(screen.getByPlaceholderText("Enter your name")).toHaveValue("");
    expect(screen.getByPlaceholderText("Enter your email")).toHaveValue("");
    expect(screen.getByPlaceholderText("Enter your message")).toHaveValue("");
  });
});
