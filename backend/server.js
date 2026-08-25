const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log(
  "Gemini key status:",
  process.env.GEMINI_API_KEY ? "FOUND" : "MISSING",
);

app.get("/", (req, res) => {
  res.json({
    message: "AI IDE Gemini backend is running",
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, code, fileName } = req.body;

    console.log("User message:", message);

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are an AI coding assistant inside an AI IDE.

File name:
${fileName || "Unknown"}

Current code:
${code || "No code provided"}

User request:
${message}

Help the user with the code.

If they ask for an explanation, explain it clearly.
If they ask for debugging, identify the problem and provide corrected code.
If they ask for improvements, suggest improvements and provide code.
`;

    console.log("Sending request to Gemini...");

    const result = await model.generateContent(prompt);

    const reply = result.response.text();

    console.log("Gemini response received.");

    res.json({
      reply: reply,
    });
  } catch (error) {
    console.error("Gemini error:", error);

    res.status(500).json({
      error: "Gemini API request failed",
      details: error.message,
    });
  }
});

const server = app.listen(PORT, () => {
  console.log(`AI IDE Gemini backend running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("SERVER ERROR:", error);
});

setInterval(() => {
  console.log("Backend is still running...");
}, 10000);
