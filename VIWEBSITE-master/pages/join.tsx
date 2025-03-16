import ContactForm from "@/components/ContactForm/ContactForm";
import Link from "next/link";
import React from "react";
import "@/styles/pages/join.styles.scss";
import Image from "next/image";
import Protestors from "../public/Images/protestors.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faInstagram,
  faYoutube,
  faTelegram,
  faTiktok
} from "@fortawesome/free-brands-svg-icons";
import MailingList from "@/components/MailingList/MailingList";

const join = () => {
  return (
    <div className="join_page">
      <div className="join_hero_container">
        <Image className="join_image" src={Protestors} alt="Protestors" />
        <h1 className="join_header">Interested in Joining Voices Ignited? </h1>
      </div>
      <div className="join_page_information_container">
        <div className="join_telegram_container">
          <h2>Join Us</h2>
          <div className="social_media_icons">
            <a href="https://www.instagram.com/voicesignited" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://www.youtube.com/@VoicesIgnited" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FontAwesomeIcon icon={faYoutube} />
            </a>
            <a href="https://voicesignited.substack.com/" target="_blank" rel="noopener noreferrer" aria-label="Substack">
              <div className="custom-icon substack-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
                </svg>
              </div>
            </a>
            <a href="https://bsky.app/profile/voicesignited.bsky.social" target="_blank" rel="noopener noreferrer" aria-label="BlueSky">
              <div className="custom-icon bluesky-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                  <path d="M12.173 3C10.173 3 6 3.5 6 7c0 2.5 2 3 3 3s2.5-1 3.5-1 2.5 1 3.5 1 3-.5 3-3c0-3.5-4.173-4-6.827-4zm0 2c2.804 0 4.5.705 4.5 2 0 .823-.5 1-1 1-.5 0-1.423-.823-3.173-.823S9 8 8.5 8c-.5 0-1-.177-1-1 0-1.295 1.696-2 4.673-2zM6.5 11C5.4 11 4 11.3 4 13.5c0 2 1.5 2.5 2.5 2.5s2-.5 3-1 2 .5 3 .5 2-.5 3-1 2 1 3 1 2.5-.5 2.5-2.5c0-2.2-1.4-2.5-2.5-2.5-.9 0-2 1-3.5 1s-2.6-1-3.5-1-2 1-3.5 1-2-1-3-1zm0 2c.5 0 1 .5 2.5.5s2.5-.5 3.5-.5 2 .5 3.5.5 2-.5 2.5-.5c.5 0 .5.5.5.5 0 .5-.5.5-.5.5s-1-.5-2.5-.5-2.5.5-3.5.5-2-.5-3.5-.5-2 .5-2.5.5c0 0-.5 0-.5-.5 0 0 0-.5.5-.5zM8 17c-1 0-3 .5-3 2.5s2 2.5 3 2.5 2-1 3.5-1 2.5 1 3.5 1 3-.5 3-2.5-2-2.5-3-2.5-2 1-3.5 1-2.5-1-3.5-1zm0 2c.5 0 1 .5 2.5.5s2.5-.5 3.5-.5c.5 0 1 .5 1 .5s-.5.5-1 .5-1-.5-2.5-.5-2.5.5-3.5.5c-.5 0-1-.5-1-.5s.5-.5 1-.5z" />
                </svg>
              </div>
            </a>
            <a href="https://www.tiktok.com/@voices_united" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <FontAwesomeIcon icon={faTiktok} />
            </a>
            <a href="https://t.me/+RQQ2h1t1sqg1ZjFh" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
              <FontAwesomeIcon icon={faTelegram} />
            </a>
          </div>
          <Link className="join_link" href={"https://tr.ee/PR3W8XdqH0"}>
            Linktree Telegram
          </Link>
          <Link className="join_link" href={"https://tr.ee/01X6whegb7"}>
            Linktree Reddit
          </Link>
          <div className="mailing-list-section">
            <MailingList />
          </div>
        </div>
        <div className="join_contact_form">
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default join;
