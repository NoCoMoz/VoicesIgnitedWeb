import { render, screen } from "@testing-library/react";
import Header from "./Header";
import "@testing-library/jest-dom";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("Header Component", () => {
  test("renders the header correctly", () => {
    render(<Header />);

    expect(screen.getByAltText("Logo")).toBeInTheDocument();

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Join")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("Shop")).toBeInTheDocument();
    expect(screen.getByText("Break The Ice")).toBeInTheDocument();
  });

  test("should contain all navigation links", () => {
    render(<Header />);

    const links = screen.getAllByRole("link");

    expect(links).toHaveLength(6); // We are rendering 5 links in total
    expect(links[0]).toHaveAttribute("href", "/");
    expect(links[1]).toHaveAttribute("href", "/about");
    expect(links[2]).toHaveAttribute("href", "/join");
    expect(links[3]).toHaveAttribute("href", "/breaktheice");
    expect(links[4]).toHaveAttribute("href", "/support");
    expect(links[5]).toHaveAttribute("href", "/shop");
  });

  test("renders the links with correct text content", () => {
    render(<Header />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Join")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("Shop")).toBeInTheDocument();
    expect(screen.getByText("Break The Ice")).toBeInTheDocument();
  });

  test("link navigates to the correct URL", () => {
    render(<Header />);

    const homeLink = screen.getByText("Home");
    expect(homeLink).toHaveAttribute("href", "/");

    const aboutLink = screen.getByText("About");
    expect(aboutLink).toHaveAttribute("href", "/about");

    const joinLink = screen.getByText("Join");
    expect(joinLink).toHaveAttribute("href", "/join");

    const supportLink = screen.getByText("Support");
    expect(supportLink).toHaveAttribute("href", "/support");

    const shopLink = screen.getByText("Shop");
    expect(shopLink).toHaveAttribute("href", "/shop");

    const breakTheIceLink = screen.getByText("Break The Ice");
    expect(breakTheIceLink).toHaveAttribute("href", "/breaktheice");
  });
});
