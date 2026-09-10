import { useState } from "react";

function AIRecommendation() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = (event) => {
    event.preventDefault();

    const question = inputValue.trim();
    if (!question) return;

    const userMessage = {
      sender: "user",
      text: question,
    };

    const aiReply = {
      sender: "ai",
      text: "The Peace Lily works well in bright, indirect light. Water it when the top inch of soil feels dry.",
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      aiReply,
    ]);

    setInputValue("");
    setIsChatOpen(true);
  };

  const handleApplyRecommendations = () => {
    setIsChatOpen(true);

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        sender: "ai",
        text: "For a Peace Lily, we recommend a medium plant size, a ceramic pot, and a light-colored pot for a clean indoor look.",
      },
    ]);
  };

  return (
    <section className="ai-recommendation">
      <div className="ai-header">
        <span className="ai-icon" aria-hidden="true">
          ✦
        </span>

        <div>
          <h3>AI Recommendations</h3>
          <p>
            Get personalized recommendations for the ideal size, pot material,
            color, and care needs for your Peace Lily.
          </p>
        </div>
      </div>

      {!isChatOpen && (
        <button
          type="button"
          className="apply-btn"
          onClick={handleApplyRecommendations}
        >
          Apply Recommendations
        </button>
      )}

      {isChatOpen && messages.length > 0 && (
        <div className="ai-chat-messages">
          {messages.map((message, index) => (
            <div
              key={`${message.sender}-${index}`}
              className={
                message.sender === "ai" ? "ai-message" : "user-message"
              }
            >
              <p>{message.text}</p>
            </div>
          ))}
        </div>
      )}

      <form className="ai-input-row" onSubmit={handleSend}>
        <label className="sr-only" htmlFor="ai-question">
          Ask AI a question
        </label>

        <input
          id="ai-question"
          type="text"
          placeholder="Ask AI a question about this arrangement..."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />

        <button
          type="submit"
          className="send-btn"
          aria-label="Send question"
        >
          ↑
        </button>
      </form>
    </section>
  );
}

export default AIRecommendation;