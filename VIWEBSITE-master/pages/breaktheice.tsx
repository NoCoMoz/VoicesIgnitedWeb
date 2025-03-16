import { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import "@/styles/pages/breaktheice.styles.scss";
import { Pin } from "@/types/Pin";
import Button from "@/components/Button/Button";

const MapComponent = dynamic(() => import("../src/components/Map/Map"), {
  ssr: false,
});

export default function BreakTheIce() {
  const [zipCode, setZipCode] = useState("");
  const [center, setCenter] = useState<[number, number]>([38.9072, -77.0369]); // Washington, D.C.
  const [error, setError] = useState<string | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [recentPinId, setRecentPinId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const response = await axios.get("/api/pins");
        setPins(response.data);
      } catch (error) {
        console.error("Error fetching pins:", error);
      }
    };

    fetchPins();
  }, []);

  const handleDeletePin = async (_id: string) => {
    try {
      const response = await axios.delete("/api/pins", {
        data: { _id },
      });

      console.log("Pin deleted successfully:", response.data.deletedPin);

      setPins((prevPins) => {
        const updatedPins = prevPins.filter((pin) => pin._id !== _id);
        return updatedPins;
      });

      if (_id === recentPinId) {
        setRecentPinId(null);
      }
    } catch (error) {
      console.error("Error deleting pin:", error);
    }
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(e.target.value);
    setError(null);
  };

  const handleSearch = async () => {
    if (!zipCode) {
      setError("Please enter a zip code.");
      return;
    }

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&postalcode=${zipCode}&country=US&limit=1`
      );

      if (response.data.length === 0) {
        setError("Zip code not found.");
        return;
      }

      const { lat, lon } = response.data[0];
      setCenter([parseFloat(lat), parseFloat(lon)]);
      setError(null);
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      setError("Failed to fetch coordinates. Please try again.");
    }
  };

  const handleMapClick = async (coords: [number, number]) => {
    try {
      const response = await axios.post("/api/pins", {
        lat: coords[0],
        lng: coords[1],
      });

      const newPin = response.data.pin;

      setPins((prevPins) => [...prevPins, newPin]);

      setRecentPinId(newPin._id);

      setTimeout(() => {
        setRecentPinId(null);
      }, 60000); // 1 minute in milliseconds
    } catch (error) {
      console.error("Error saving pin:", error);
    }
  };

  return (
    <div className="bti-container">
      <h1 className="bti-header">Welcome to Break the Ice</h1>

      <div className="bti_info_container">
        <p className="bti-explain">
          This page is for informing people of where I.C.E has been spotted. It
          allows for you to come in and drop a pin in the location you saw
          I.C.E. This pin will stay around for 24 hours to help inform others.
        </p>
        <div className="bti-hit">
          <h2 className="bti-hit-header"> How it Works:</h2>
          <p>
            1. Type in the Zip Code of the location you spotted I.C.E in and
            click Search{" "}
          </p>
          <p>
            2. Zoom into around the location you saw I.C.E with the arrows at
            the top left of the map{" "}
          </p>
          <p>3. Drop a pin by clicking the location on the map </p>
          <p>4. If you accidently drop a pin in the wrong location you have 1 minute to delete the pin before its saved </p>

        </div>
      </div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter zip code"
          value={zipCode}
          onChange={handleZipCodeChange}
          className="input-field"
        />
        <Button onClick={handleSearch} text="Search"></Button>
      </div>
      {error && <p className="error-message">{error}</p>}
      <MapComponent
        key={pins.length}
        center={center}
        pins={pins}
        onMapClick={handleMapClick}
        onDeletePin={handleDeletePin}
        recentPinId={recentPinId}
      />
    </div>
  );
}
