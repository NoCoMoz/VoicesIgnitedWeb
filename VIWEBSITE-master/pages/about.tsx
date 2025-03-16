import React, { useEffect, useState } from "react";
import Image from "next/image";
import LogoWhite from "../public/Images/vi_logo_white.jpg";
import UnitedPeople from "../public/Images/united_people.jpg";
import "@/styles/pages/about.styles.scss";
import axios from "axios";

interface Mission {
  _id: string;
  heading: string;
  content: string[];
}

const About = () => {
  const [missionData, setMissionData] = useState<Mission[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissionData = async () => {
      try {
        const res = await axios.get("/api/mission");
        setMissionData(res.data);
      } catch (error) {
        setError("Failed to load mission data.");
        console.error(error);
      }
    };

    fetchMissionData();
  }, []);

  return (
    <div className="about_page_container">
      <div className="top_container">
        <h2 className="about_header">
          Reclaiming our Government from Corruption
        </h2>
        <Image
          className="united_people"
          src={UnitedPeople}
          alt="United People"
        />
      </div>

      <div className="mission_statement_container ">
        <Image
          className="logo-white"
          src={LogoWhite}
          alt="Voices Ignited Logo"
        />
        {error ? (
          <h3>{error}</h3>
        ) : missionData.length > 0 ? (
          <div className="mission_statement_words_container">
            <h2 className="mission_title">Voices Ignited Mission Statement</h2>
            {missionData[1].content.map((text, index) => (
              <p className="mission_statement_paragraph" key={index}>
                {text}
              </p>
            ))}
          </div>
        ) : (
          <h3>Loading...</h3>
        )}
      </div>
    </div>
  );
};

export default About;
