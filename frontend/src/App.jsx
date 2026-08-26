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
}

export default App;`,

  "App.css": `body {
  margin: 0;
  font-family: Arial, sans-serif;
}`,

  "main.jsx": `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

  "package.json": `{
  "name": "ai-ide",
  "version": "1.0.0",
  "private": true
}`,
};

function App() {
  const [files, setFiles] = useState(initialFiles);
  const [activeFile, setActiveFile] = useState("App.jsx");
  const [prompt, setPrompt] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! 👋 I'm your AI coding assistant.\n\nAsk me to write, explain, debug, or improve your code.",
    },
  ]);

  const [terminal, setTerminal] = useState("$ AI IDE terminal ready...");

  const handleFileClick = (file) => {
    setActiveFile(file);
  };

  const handleEditorChange = (value) => {
    setFiles((prev) => ({
      ...prev,
      [activeFile]: value || "",
    }));
  };

  const sendMessage = async () => {
    if (!prompt.trim() || isThinking) return;

    const userMessage = prompt.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessage,
      },
    ]);

    setPrompt("");
    setIsThinking(true);

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
            fileName: activeFile,
          }),
        },
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.error || data.details || `Backend error (${response.status})`,
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply || data.message || "AI responded successfully.",
        },
      ]);
    } catch (error) {
      console.error("AI request error:", error);

      let errorMessage = error.message;

      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        errorMessage =
          "Unable to reach the AI backend. Please check the backend connection.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `❌ ${errorMessage}`,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleRun = () => {
    setTerminal(
      `$ npm run dev

> ai-ide@1.0.0 dev
> vite

✓ Project started successfully
✓ Active file: ${activeFile}`,
    );
  };

  const handleDebug = () => {
    setPrompt("Can you debug this code?");
  };

  const handleGit = () => {
    setTerminal(
      `$ git status

On branch main

Changes:
  modified: ${activeFile}

✓ Git status completed`,
    );
  };

  const handleDeploy = () => {
    setTerminal(
      `🚀 Deployment started...

Building project...
✓ Build completed
✓ Deployment process started`,
    );
  };

  return (
    <div className="ide">
      <header className="topbar">
        <div className="logo">⚡ AI IDE</div>

        <div className="toolbar">
          <button onClick={handleRun}>▶ Run</button>
          <button onClick={handleDebug}>🐛 Debug</button>
          <button onClick={handleGit}>Git</button>
          <button onClick={handleDeploy}>Deploy</button>
        </div>
      </header>

      <div className="main">
        <aside className="explorer">
          <h3>EXPLORER</h3>

          <div className="folder">📁 src</div>

          {["App.jsx", "App.css", "main.jsx"].map((file) => (
            <div
              key={file}
              className={activeFile === file ? "file active" : "file"}
              onClick={() => handleFileClick(file)}
            >
              📄 {file}
            </div>
          ))}

          <div className="folder">📁 public</div>

          <div
            className={activeFile === "package.json" ? "file active" : "file"}
            onClick={() => handleFileClick("package.json")}
          >
            📄 package.json
          </div>
        </aside>

        <section className="editor-panel">
          <div className="editor-header">{activeFile}</div>

          <Editor
            height="100%"
            language={
              activeFile.endsWith(".jsx")
                ? "javascript"
                : activeFile.endsWith(".css")
                  ? "css"
                  : activeFile.endsWith(".json")
                    ? "json"
                    : "javascript"
            }
            theme="vs-dark"
            value={files[activeFile]}
            onChange={handleEditorChange}
            options={{
              minimap: {
                enabled: false,
              },
              fontSize: 14,
              automaticLayout: true,
            }}
          />
        </section>

        <aside className="ai-panel">
          <div className="ai-header">🤖 AI Assistant</div>

          <div className="messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "user"
                    ? "message user-message"
                    : "message ai-message"
                }
              >
                <h3>{message.role === "user" ? "You" : "AI"}</h3>

                <p>{message.text}</p>
              </div>
            ))}

            {isThinking && (
              <div className="message ai-message">
                <h3>AI</h3>
                <p>🤖 Thinking...</p>
              </div>
            )}
          </div>

          <div className="chat-input">
            <textarea
              placeholder="Ask AI anything about your code..."
              value={prompt}
              disabled={isThinking}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              onClick={sendMessage}
              disabled={isThinking || !prompt.trim()}
            >
              {isThinking ? "Thinking..." : "Send"}
            </button>
          </div>
        </aside>
      </div>

      <section className="terminal">
        <div className="terminal-header">TERMINAL</div>

        <pre>{terminal}</pre>
      </section>
    </div>
  );
}

export default App;
