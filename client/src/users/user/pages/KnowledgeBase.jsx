import React, { useState } from "react";

const KnowledgeBase = () => {
  // State to manage which accordion item is open
  const [openIndex, setOpenIndex] = useState(null);

  // Accordion data (questions and answers)
  const faqData = [
    {
      question: "How do I reset my password?",
      answer:
        "To reset your password, go to the login page and click on 'Forgot Password'. Follow the instructions sent to your email.",
    },
    {
      question: "How do I create a new ticket?",
      answer:
        "Navigate to the 'Create Ticket' page and fill out the form with your issue details. Click 'Submit' to create the ticket.",
    },
    {
      question: "What is the response time for support?",
      answer:
        "Our support team aims to respond within 24 hours. For urgent issues, please mark your ticket as 'High Priority'.",
    },
    {
      question: "How do I update my profile information?",
      answer:
        "Go to the 'Profile' section in your dashboard. You can edit your information and save the changes.",
    },
    {
      question: "Where can I find my ticket history?",
      answer:
        "All your tickets can be found in the 'Tickets' section of your dashboard. You can view their status and details there.",
    },
  ];

  // Toggle accordion item
  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="p-6 bg-background">
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        Knowledge Base
      </h1>
      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            {/* Question */}
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
            >
              <span className="text-lg font-medium text-foreground">
                {item.question}
              </span>
              <span className="text-primary">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>

            {/* Answer */}
            {openIndex === index && (
              <div className="p-4 pt-0 text-foreground">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;