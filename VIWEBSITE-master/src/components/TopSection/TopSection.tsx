import React, { useEffect, useState } from "react";
import "@/styles/components/topSection.styles.scss";
import Button from "../Button/Button";
import { useRouter } from "next/router";

interface Mission {
  _id: string;
  heading: string;
  content: string[];
}

interface TopSectionProps {
  missionData: Mission[];
}

const TopSection = ({ missionData }: TopSectionProps) => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  // Add animation trigger when component mounts
  useEffect(() => {
    // Short delay to ensure CSS transitions work properly
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`top-section-container ${isLoaded ? 'loaded' : ''}`}>
      <div className="title-container">
        <h1 data-text="We are Voices Ignited">We are Voices Ignited</h1>
      </div>

      <div className="description-container">
        {missionData.length > 0 && missionData[0].content.length > 0 ? (
          <h3 className="mission-content">{missionData[0].content[0]}</h3>
        ) : (
          <h3 className="mission-content">
            Voices Ignited is a bipartisan organization dedicated to eliminating corruption 
            and greed that currently plagues our government. 
            We are not about left vs right. We are top vs down.
          </h3>
        )}

        <div className="buttons-container">
          <Button
            onClick={() => router.push("/join")}
            text="Join The Movement"
            aria-label="Join the movement"
          />
          <Button
            text="Support the Movement"
            onClick={() => router.push("/support")}
            aria-label="Support the movement"
          />
        </div>
      </div>
    </div>
  );
};

export default TopSection;
