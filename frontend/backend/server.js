const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --------------------------------------------------
// DEMO FALLBACK AI
// --------------------------------------------------

function getFallbackReply(message, files = {}) {
  const text = message.toLowerCase();

  if (
    text.includes("explain") ||
    text.includes("what does") ||
    text.includes("understand")
  ) {
    return `🤖 Demo AI Explanation

Your project is an AI-powered web IDE built with React and Node.js.

Main parts:

1. Monaco Editor
   - Allows users to write and edit code.

2. File Explorer
   - Displays files such as App.jsx, App.css and main.jsx.

3. Run button
   - Reads the React code and generates a preview.

4. Terminal
   - Displays execution and project messages.

5. AI Assistant
   - Sends the user's question and project files to the backend.

6. Node.js backend
   - Connects the frontend to the AI service.

The current AI request is being handled by the backend.

This is a demo fallback response because the real AI service is currently unavailable.`;
  }

  if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    return `Hello! 👋

I'm your AI coding assistant.

You can ask me things like:

• Explain the code
• Find bugs
• Improve this code
• Write a React component
• Explain this error
• Add a feature`;
  }

  if (
    text.includes("bug") ||
    text.includes("error") ||
    text.includes("debug")
  ) {
    return `🐛 Demo Debug Assistant

I can help you debug your code.

I'll normally analyze:

• Syntax errors
• React errors
• JavaScript errors
• Missing imports
• Incorrect variables
• API problems

Send me the code or error message and I'll explain what needs to be fixed.

⚠️ This is currently a demo fallback response.`;
  }

  if (
    text.includes("write") ||
    text.includes("create") ||
    text.includes("generate")
  ) {
    return `💻 Demo Code Generator

I can generate code for your project.

For example, you can ask:

"Create a React login page"

"Create a navbar"

"Create a todo application"

"Create an API endpoint"

⚠️ The real AI generation will be enabled when the AI API has available quota.`;
  }

  return `🤖 Demo AI Assistant

I received your request:

"${message}"

Your AI IDE backend is working correctly.

The real AI service is currently unavailable because the API account has insufficient quota, so I'm providing a demo response instead.

Try asking:

• "Explain the code"
• "Debug this code"
• "Create a React component"
• "Hello"`;
}

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    message: "AI IDE backend is running!",
  });
});

// --------------------------------------------------
// AI CHAT
// --------------------------------------------------

app.post("/api/chat", async (req, res) => {
  const { message, files = {} } = req.body;

  console.log("User message:", message);

  if (!message) {
    return res.status(400).json({
      error: "Message is required",
    });
  }

  try {
    console.log("Sending request to OpenAI...");

    const response = await openai.responses.create({
      model: "gpt-4o-mini",

      input: [
        {
          role: "system",
          content:
            "You are an AI coding assistant inside a web-based IDE. Help the user explain, debug, improve and write code. Give clear and useful answers.",
        },
        {
          role: "user",
          content: `User question:

${message}

Project files:

${JSON.stringify(files, null, 2)}`,
        },
      ],
    });

    const reply = response.output_text;

    console.log("OpenAI response received.");

    return res.json({
      reply,
      source: "openai",
    });
  } catch (error) {
    console.error("OpenAI error:", error.status, error.code);

    // Use fallback instead of returning 500
    const fallbackReply = getFallbackReply(message, files);

    return res.json({
      reply: fallbackReply,
      source: "demo-fallback",
    });
  }
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI IDE backend running on port ${PORT}`);
});
