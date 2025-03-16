import { render, screen } from "@testing-library/react";
import Join from "../pages/join";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} alt={props.alt} />
  ),
}));

describe("Join Page", () => {
  it("renders the page correctly", () => {
    render(<Join />);

    expect(
      screen.getByText("Interested in Joining Voices Ignited?")
    ).toBeInTheDocument();

    const image = screen.getByAltText("Protestors");
    expect(image).toBeInTheDocument();

    expect(screen.getByText("Join the Telegram")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Click the button to be redirected to the Linktree in order to join the telegram or reddit chat. This is where we get to know each other, organize, plan, share resources, and more."
      )
    ).toBeInTheDocument();

    const telegramLink = screen.getByText("Linktree Telegram");
    expect(telegramLink).toBeInTheDocument();
    expect(telegramLink).toHaveAttribute("href", "https://tr.ee/PR3W8XdqH0");

    const redditLink = screen.getByText("Linktree Reddit");
    expect(redditLink).toBeInTheDocument();
    expect(redditLink).toHaveAttribute("href", "https://tr.ee/01X6whegb7");

    expect(screen.getByTestId("contact-form")).toBeInTheDocument(); // Assuming the ContactForm has a form role
  });

  it("renders ContactForm component without errors", () => {
    render(<Join />);
    const formElement = screen.getByTestId("contact-form");
    expect(formElement).toBeInTheDocument();
  });

  it("ensures that the 'join_link' class is applied correctly to the links", () => {
    render(<Join />);
    const telegramLink = screen.getByText("Linktree Telegram");
    const redditLink = screen.getByText("Linktree Reddit");

    expect(telegramLink).toHaveClass("join_link");
    expect(redditLink).toHaveClass("join_link");
  });
});
