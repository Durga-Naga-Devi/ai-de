```javascript
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "AI IDE backend is running!",
  });
});

// AI Chat - Demo Mode
app.post("/api/chat", async (req, res) => {
  const { message, files } = req.body;

  console.log("User message:", message);

  if (!message || !message.trim()) {
    return res.status(400).json({
      error: "Message is required.",
    });
  }

  const text = message.toLowerCase();

  let reply;

  if (
    text.includes("hello") ||
    text.includes("hi") ||
    text.includes("hey")
  ) {
    reply =
      "Hello! 👋\n\n" +
      "I'm your AI IDE demo assistant.\n\n" +
      "Try asking me:\n" +
      "• Explain the code\n" +
      "• Debug this code\n" +
      "• Improve this code\n" +
      "• What does this function do?";
  } else if (text.includes("explain")) {
    reply =
      "🤖 Demo AI Assistant\n\n" +
      "This project is a React-based AI IDE.\n\n" +
      "The main parts are:\n\n" +
      "1. Explorer — displays project files.\n" +
      "2. Monaco Editor — allows you to edit code.\n" +
      "3. Run button — generates the React preview.\n" +
      "4. Terminal — displays execution information.\n" +
      "5. AI Assistant — communicates with the backend.\n\n" +
      "The current project is running in Demo AI mode.";
  } else if (
    text.includes("debug") ||
    text.includes("error") ||
    text.includes("fix")
  ) {
    reply =
      "🤖 Demo AI Assistant\n\n" +
      "To debug your code, check these areas:\n\n" +
      "1. Browser Console\n" +
      "2. Terminal output\n" +
      "3. The file containing the error\n" +
      "4. Network requests to the backend\n\n" +
      "Your AI IDE backend is connected successfully.";
  } else if (
    text.includes("improve") ||
    text.includes("better") ||
    text.includes("optimize")
  ) {
    reply =
      "🤖 Demo AI Assistant\n\n" +
      "Possible improvements for your AI IDE:\n\n" +
      "• Add file creation and deletion\n" +
      "• Add multiple editor tabs\n" +
      "• Improve the terminal\n" +
      "• Add a real code execution system\n" +
      "• Add AI-powered code suggestions\n" +
      "• Add Git integration\n" +
      "• Add deployment controls";
  } else {
    reply =
      "🤖 Demo AI Assistant\n\n" +
      `You asked: "${message}"\n\n` +
      "I received your request successfully.\n\n" +
      "Try asking:\n" +
      "• Explain the code\n" +
      "• Debug this code\n" +
      "• Improve this code";
  }

  console.log("Sending demo response.");

  res.json({
    reply: reply,
    demo: true,
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI IDE backend running on port ${PORT}`);
});
