import { useState } from "react";
import Editor from "@monaco-editor/react";
import "./App.css";

const initialFiles = {
  "App.jsx": {
    language: "javascript",
    code: `function App() {
  return (
    <div>
      <h1>Hello AI IDE</h1>
      <p>Your React preview is working!</p>
    </div>
  );
}

export default App;`,
  },

  "App.css": {
    language: "css",
    code: `body {
  margin: 0;
  font-family: Arial, sans-serif;
}

h1 {
  color: #2563eb;
}`,
  },

  "main.jsx": {
    language: "javascript",
    code: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  },

  "package.json": {
    language: "json",
    code: `{
  "name": "ai-ide",
  "version": "1.0.0",
  "private": true
}`,
  },
};

function App() {
  const [files, setFiles] = useState(initialFiles);
  const [activeFile, setActiveFile] = useState("App.jsx");

  const [terminalOutput, setTerminalOutput] = useState(
    "AI IDE terminal ready...",
  );

  const [showPreview, setShowPreview] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("Hello AI IDE");

  const [aiMessages, setAiMessages] = useState([
    {
      role: "ai",
      text: "Hello! 👋 Ask me anything about your code.",
    },
  ]);

  const [aiInput, setAiInput] = useState("");

  const currentFile = files[activeFile];

  const handleEditorChange = (value) => {
    setFiles({
      ...files,
      [activeFile]: {
        ...files[activeFile],
        code: value || "",
      },
    });
  };

  // RUN
  const handleRun = () => {
    const code = files["App.jsx"].code;

    const match = code.match(/<h1>(.*?)<\/h1>/);

    const title = match ? match[1] : "Hello AI IDE";

    setPreviewTitle(title);

    setTerminalOutput(
      `Running App.jsx...\n\n` +
        `✓ React application started\n` +
        `✓ Preview generated successfully`,
    );

    setShowPreview(true);
  };

  // AI ASSISTANT
  const handleAISend = async () => {
    if (!aiInput.trim()) return;

    const messageToSend = aiInput;

    const userMessage = {
      role: "user",
      text: messageToSend,
    };

    setAiMessages((messages) => [...messages, userMessage]);

    setAiInput("");

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: userMessage,
          code: files["App.jsx"].code,
        }),
      });

      const data = await response.json();

      setAiMessages((messages) => [
        ...messages,
        {
          role: "ai",
          text: data.reply,
        },
      ]);
    } catch (error) {
      setAiMessages((messages) => [
        ...messages,
        {
          role: "ai",
          text: "❌ Could not connect to AI backend.",
        },
      ]);
    }
  };

  return (
    <div className="ide">
      {/* TOP BAR */}
      <header className="topbar">
        <div className="logo">⚡ AI IDE</div>

        <div className="actions">
          <button onClick={handleRun}>▶ Run</button>

          <button>🐛 Debug</button>

          <button>Git</button>

          <button>Deploy</button>
        </div>
      </header>

      <div className="main">
        {/* EXPLORER */}
        <aside className="explorer">
          <div className="panel-title">EXPLORER</div>

          <div className="folder">📁 src</div>

          {["App.jsx", "App.css", "main.jsx"].map((file) => (
            <div
              key={file}
              className={`file ${activeFile === file ? "active" : ""}`}
              onClick={() => setActiveFile(file)}
            >
              📄 {file}
            </div>
          ))}

          <div className="folder">📁 public</div>

          <div
            className={`file ${activeFile === "package.json" ? "active" : ""}`}
            onClick={() => setActiveFile("package.json")}
          >
            📄 package.json
          </div>
        </aside>

        {/* EDITOR */}
        <section className="editor-section">
          <div className="editor-tabs">
            <div className="tab active-tab">📄 {activeFile}</div>

            <div className="language">{currentFile.language}</div>
          </div>

          <div className="editor">
            <Editor
              height="100%"
              language={currentFile.language}
              theme="vs-dark"
              value={currentFile.code}
              onChange={handleEditorChange}
              options={{
                fontSize: 15,

                minimap: {
                  enabled: true,
                },

                automaticLayout: true,

                padding: {
                  top: 15,
                },
              }}
            />
          </div>

          {/* TERMINAL */}
          <div className="terminal">
            <div className="terminal-title">TERMINAL</div>

            <div className="terminal-content">
              <span>$</span>

              <pre>{terminalOutput}</pre>
            </div>
          </div>
        </section>

        {/* PREVIEW */}
        {showPreview && (
          <section className="preview">
            <div className="preview-header">
              <span>🌐 Preview</span>

              <button onClick={() => setShowPreview(false)}>✕</button>
            </div>

            <div className="preview-content">
              <h1>{previewTitle}</h1>

              <p>Your React preview is working!</p>
            </div>
          </section>
        )}

        {/* AI ASSISTANT */}
        <aside className="assistant">
          <div className="assistant-header">🤖 AI Assistant</div>

          <div className="assistant-content">
            {aiMessages.map((message, index) => (
              <div key={index} className={`ai-message ${message.role}`}>
                <strong>{message.role === "ai" ? "AI:" : "You:"}</strong>

                <p>{message.text}</p>
              </div>
            ))}
          </div>

          <div className="assistant-input">
            <input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAISend();
                }
              }}
              placeholder="Ask AI anything..."
            />

            <button onClick={handleAISend}>Send</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
