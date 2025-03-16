import React, { useState, useRef } from "react";
import "@/styles/components/contactForm.styles.scss";
import Button from "../Button/Button";

const Contact = () => {
  const [result, setResult] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult("Sending....");

    const formData = new FormData(event.currentTarget);
    formData.append("access_key", "c046808a-f8b1-447a-9a10-3e24a5e1d8b8");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      setResult("Form Submitted Successfully");
      if (formRef.current) {
        formRef.current.reset();
      }
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
  };

  return (
    <div
      data-testid="contact-form"
      id="contact"
      className="contact-form-container"
    >
      <div>
        <h2> Send Us an Email </h2>
      </div>
      <form onSubmit={onSubmit} ref={formRef} className="contact-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Enter your name"
            required
            name="name"
            aria-label="Enter your name"
          />
          <input
            type="email"
            placeholder="Enter your email"
            required
            name="email"
            aria-label="Enter your email"
          />
        </div>
        <textarea
          name="message"
          rows={6}
          placeholder="Enter your message"
          required
          aria-label="Enter your message"
        />
        <div className="form-button">
          <Button text="Submit" />
        </div>
        <p>{result}</p>
      </form>
    </div>
  );
};

export default Contact;
