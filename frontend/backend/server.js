const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({
    message: "AI IDE backend is running!",
  });
});

app.post("/api/chat", (req, res) => {
  const { message } = req.body;

  console.log("User message:", message);

  if (!message || !message.trim()) {
    return res.status(400).json({
      error: "Message is required",
    });
  }

  const text = message.toLowerCase();

  let reply;

  if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    reply =
      "Hello! 👋\n\n" +
      "I'm your AI IDE demo assistant.\n\n" +
      "Try asking me:\n" +
      "• Explain the code\n" +
      "• Debug this code\n" +
      "• Improve this code";
  } else if (text.includes("explain")) {
    reply =
      "🤖 Demo AI Assistant\n\n" +
      "Your AI IDE contains an Explorer, Monaco Code Editor, " +
      "Terminal, Preview panel, and AI Assistant.\n\n" +
      "The Explorer shows your files. " +
      "The Monaco Editor lets you edit code. " +
      "The Run button creates the preview. " +
      "The AI Assistant communicates with this backend.";
  } else if (
    text.includes("debug") ||
    text.includes("error") ||
    text.includes("fix")
  ) {
    reply =
      "🤖 Demo AI Assistant\n\n" +
      "For debugging, check the browser console, " +
      "terminal output, and the file containing the error.";
  } else if (
    text.includes("improve") ||
    text.includes("better") ||
    text.includes("optimize")
  ) {
    reply =
      "🤖 Demo AI Assistant\n\n" +
      "Possible improvements:\n\n" +
      "• Add file creation\n" +
      "• Add file deletion\n" +
      "• Add multiple tabs\n" +
      "• Improve the terminal\n" +
      "• Add real code execution\n" +
      "• Add Git integration";
  } else {
    reply =
      "🤖 Demo AI Assistant\n\n" +
      'You asked: "' +
      message +
      '"\n\n' +
      "I received your request successfully.\n\n" +
      "Try asking me to explain, debug, or improve your code.";
  }

  res.json({
    reply: reply,
    demo: true,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("AI IDE backend running on port " + PORT);
});
