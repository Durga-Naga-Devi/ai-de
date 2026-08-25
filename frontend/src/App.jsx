import { useState } from "react";
import Editor from "@monaco-editor/react";
import "./App.css";

const initialFiles = {
  "App.jsx": `function App() {
  return (
    <div>
      <h1>Hello AI IDE!</h1>
      <p>Start coding here.</p>
    </div>
  );
}`,

  "main.jsx": `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
};

function App() {
  const [files, setFiles] = useState(initialFiles);
  const [activeFile, setActiveFile] = useState("App.jsx");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "🤖 AI Assistant\n\nHello! Ask me to explain, debug, or improve your code.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEditorChange = (value) => {
    setFiles((prev) => ({
      ...prev,
      [activeFile]: value || "",
    }));
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://ai-de-backend.onrender.com/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            code: files[activeFile],
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI request failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error("AI Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "❌ Unable to connect to the AI backend. Please check your backend.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>⚡ AI IDE</h1>

        <div className="buttons">
          <button>▶ Run</button>
          <button>🐛 Debug</button>
          <button>Git</button>
          <button>Deploy</button>
        </div>
      </header>

      <div className="main-container">
        <aside className="explorer">
          <h3>EXPLORER</h3>

          <div className="folder">📁 src</div>

          {Object.keys(files).map((file) => (
            <div
              key={file}
              className={`file ${activeFile === file ? "active-file" : ""}`}
              onClick={() => setActiveFile(file)}
            >
              📄 {file}
            </div>
          ))}
        </aside>

        <section className="editor-section">
          <div className="editor-title">{activeFile}</div>

          <Editor
            height="100%"
            theme="vs-dark"
            language="javascript"
            value={files[activeFile]}
            onChange={handleEditorChange}
            options={{
              minimap: {
                enabled: false,
              },
              fontSize: 14,
            }}
          />
        </section>

        <aside className="assistant">
          <div className="assistant-header">🤖 AI Assistant</div>

          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <strong>{message.role === "user" ? "You:" : "AI:"}</strong>

                <div className="message-content">{message.content}</div>
              </div>
            ))}

            {loading && (
              <div className="message assistant">
                <strong>AI:</strong>

                <div className="message-content">🤔 Thinking...</div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI about your code..."
              rows="3"
            />

            <button onClick={handleSendMessage} disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
