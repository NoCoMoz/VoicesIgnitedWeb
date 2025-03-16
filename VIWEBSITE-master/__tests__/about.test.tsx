import { act, render, screen, waitFor } from "@testing-library/react";
import About from "../pages/about";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("About Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the About page with the loading state initially", () => {
    render(<About />);

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("should render the mission data after fetching", async () => {
    const mockMissionData = [
      {
        _id: "1",
        heading: "Mission Heading 1",
        content: ["This is the first mission statement."],
      },
      {
        _id: "2",
        heading: "Mission Heading 2",
        content: ["This is the second mission statement."],
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockMissionData });

    render(<About />);

    await waitFor(() => screen.getByText(/Voices Ignited Mission Statement/i));

    expect(
      screen.getByText("This is the second mission statement.")
    ).toBeInTheDocument();
  });

  it("should render an error message if fetching mission data fails", async () => {
    mockedAxios.get.mockRejectedValueOnce(
      new Error("Error fetching mission data")
    );

    render(<About />);

    await waitFor(() =>
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument()
    );

    await act(async () => {
      await waitFor(() => screen.getByText(/Failed to load mission data/i));
    });

    expect(
      screen.getByText(/Failed to load mission data/i)
    ).toBeInTheDocument();
  });
});
