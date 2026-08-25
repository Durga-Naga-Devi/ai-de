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
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! 👋 I'm your AI coding assistant.\\n\\nAsk me to write, explain, debug, or improve your code.",
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
    if (!prompt.trim()) return;

    const userMessage = prompt;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessage,
      },
    ]);

    setPrompt("");

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          code: files[activeFile],
          fileName: activeFile,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply || data.message || "AI responded successfully.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "❌ Could not connect to the AI backend. Please make sure your backend is running.",
        },
      ]);
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
    setTerminal(
      `🐛 Debug started...

Checking ${activeFile}...

✓ Debug session started
✓ No runtime errors detected`,
    );
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
      {/* HEADER */}
      <header className="topbar">
        <div className="logo">⚡ AI IDE</div>

        <div className="toolbar">
          <button onClick={handleRun}>▶ Run</button>
          <button onClick={handleDebug}>🐛 Debug</button>
          <button onClick={handleGit}>Git</button>
          <button onClick={handleDeploy}>Deploy</button>
        </div>
      </header>

      {/* MAIN AREA */}
      <div className="main">
        {/* EXPLORER */}
        <aside className="explorer">
          <h3>EXPLORER</h3>

          <div className="folder">📁 src</div>

          <div
            className={activeFile === "App.jsx" ? "file active" : "file"}
            onClick={() => handleFileClick("App.jsx")}
          >
            📄 App.jsx
          </div>

          <div
            className={activeFile === "App.css" ? "file active" : "file"}
            onClick={() => handleFileClick("App.css")}
          >
            📄 App.css
          </div>

          <div
            className={activeFile === "main.jsx" ? "file active" : "file"}
            onClick={() => handleFileClick("main.jsx")}
          >
            📄 main.jsx
          </div>

          <div className="folder">📁 public</div>

          <div
            className={activeFile === "package.json" ? "file active" : "file"}
            onClick={() => handleFileClick("package.json")}
          >
            📄 package.json
          </div>
        </aside>

        {/* EDITOR */}
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

        {/* AI ASSISTANT */}
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
                {message.role === "ai" && <h3>AI</h3>}

                {message.role === "user" && <h3>You</h3>}

                <p>{message.text}</p>
              </div>
            ))}
          </div>

          <div className="chat-input">
            <textarea
              placeholder="Ask AI anything about your code..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button onClick={sendMessage}>Send</button>
          </div>
        </aside>
      </div>

      {/* TERMINAL */}
      <section className="terminal">
        <div className="terminal-header">TERMINAL</div>

        <pre>{terminal}</pre>
      </section>
    </div>
  );
}

export default App;
