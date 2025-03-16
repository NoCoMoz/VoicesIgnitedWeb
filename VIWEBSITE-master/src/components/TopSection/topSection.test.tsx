import { render, screen, fireEvent } from "@testing-library/react";
import TopSection from "@/components/TopSection/TopSection";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
  push: mockPush,
});

describe("TopSection Component", () => {
  const missionData = [
    {
      _id: "1",
      heading: "Test Mission",
      content: ["Test Content 1", "Test Content 2"],
    },
  ];

  it("renders mission content when missionData is provided", () => {
    render(<TopSection missionData={missionData} />);

    expect(screen.getByText("Test Content 1")).toBeInTheDocument();
    expect(
      screen.queryByText("No mission data available.")
    ).not.toBeInTheDocument();
  });

  it("renders fallback message when missionData is empty", () => {
    render(<TopSection missionData={[]} />);

    expect(screen.getByText("No mission data available.")).toBeInTheDocument();
    expect(screen.queryByText("Test Content 1")).not.toBeInTheDocument();
  });

  it("navigates to the correct route when 'Join The Movement' button is clicked", () => {
    render(<TopSection missionData={missionData} />);

    fireEvent.click(screen.getByText("Join The Movement"));

    expect(mockPush).toHaveBeenCalledWith("/join");
  });

  it("navigates to the correct route when 'Support the Movement' button is clicked", () => {
    render(<TopSection missionData={missionData} />);

    fireEvent.click(screen.getByText("Support the Movement"));

    expect(mockPush).toHaveBeenCalledWith("/support");
  });
});
