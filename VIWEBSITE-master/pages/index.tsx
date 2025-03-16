import TopSection from "@/components/TopSection/TopSection";
import BlueSkyFeed from "@/components/BlueSkyFeed/BlueSkyFeed";
import "@/styles/index.styles.scss";

interface Mission {
  _id: string;
  heading: string;
  content: string[];
}

// Use getStaticPaths to handle static generation
export async function getStaticPaths() {
  return {
    paths: [{ params: {} }], // Include the index route
    fallback: false, // Show 404 for non-existent paths
  };
}

// Use getStaticProps instead of getServerSideProps for static export
export async function getStaticProps() {
  try {
    // For static export, we'll use mock data
    const mockMissionData: Mission[] = [
      {
        _id: "1",
        heading: "Our Mission",
        content: [
          "Voices Ignited is a nonpartisan force committed to exposing and dismantling the corruption and greed that infect our government. We don’t play the left vs. right game—we stand for the people against the powerful. This is about justice, integrity, and reclaiming a system that works for everyone.",
          "Building inclusive digital communities",
          "Fostering meaningful connections"
        ]
      }
    ];

    return {
      props: {
        missionData: mockMissionData,
      },
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return {
      props: {
        missionData: [],
      },
    };
  }
}

export default function Home({ missionData }: { missionData: Mission[] }) {
  return (
    <div className="page">
      <div className="body-home">
        <TopSection missionData={missionData} />
        <div className="bluesky-section">
          <div className="container">
            <BlueSkyFeed postLimit={5} />
          </div>
        </div>
      </div>
    </div>
  );
}
