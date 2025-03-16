import React, { useState, useEffect } from "react";
import Image from "next/image";
import logo from "../../../public/Images/white-logo.png";
import "@/styles/components/header.styles.scss";
import Link from "next/link";

/**
 * Header component for the Voices Ignited website
 * Displays the logo and navigation links with a hamburger menu on mobile
 */
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Fix for hydration issues - only render dynamic content after client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle mobile detection and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check on initial render
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Clean up event listener
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when a link is clicked
  const handleLinkClick = () => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  // Navigation links array for easy maintenance
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/join", label: "Join" },
    { href: "/events", label: "Events" },
    { href: "/breaktheice", label: "Break The Ice" },
    { href: "/support", label: "Support" },
    { href: "/shop", label: "Shop" },
  ];

  return (
    <div className="header-container">
      <Image className="logo" src={logo} alt="Voices Ignited Logo" />
      
      {/* Always render the desktop navigation for server-side rendering */}
      <div className={`links-container desktop-nav ${isClient && isMobile ? 'hidden' : ''}`}>
        {navLinks.map((link) => (
          <Link 
            key={link.href} 
            className="link" 
            href={link.href}
            onClick={handleLinkClick}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Only render mobile elements after client-side hydration */}
      {isClient && (
        <>
          {/* Hamburger Menu Button - Only visible on mobile */}
          {isMobile && (
            <div style={{ 
              position: 'fixed', 
              top: '1.5rem', 
              right: '1.5rem', 
              zIndex: 3000
            }}>
              <button 
                className="hamburger-button" 
                onClick={toggleMenu}
                aria-label="Toggle navigation menu"
                style={{
                  background: 'transparent',
                  position: 'static',
                  display: 'flex'
                }}
              >
                <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
              </button>
            </div>
          )}

          {/* Mobile Navigation - Only visible when menu is open and on mobile */}
          {isMobile && (
            <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  className="link" 
                  href={link.href}
                  onClick={handleLinkClick}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Header;
