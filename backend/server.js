const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

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

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

app.post("/api/chat", async (req, res) => {
  try {
    const { message, code, fileName } = req.body;

    console.log("User message:", message);

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is not configured on the server.",
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
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

Important instructions:
- Understand the user's exact request.
- If they ask for an explanation, explain the code clearly and simply.
- If they ask for debugging, identify the problem and provide corrected code.
- If they ask for improvements, explain the improvements and provide code.
- If they ask to write code, provide complete usable code.
- If the user asks a general programming question, answer it directly.
- Do not say the user's request was cut off unless it actually is incomplete.
`;

    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(
          `Sending request to Gemini... Attempt ${attempt}/${MAX_RETRIES}`,
        );

        const result = await model.generateContent(prompt);

        const reply = result.response.text();

        console.log("Gemini response received.");

        return res.json({
          reply,
        });
      } catch (error) {
        console.error(`Gemini attempt ${attempt} failed:`, error.message);

        const status = error.status || error.statusCode;

        const isTemporaryError =
          status === 429 ||
          status === 500 ||
          status === 502 ||
          status === 503 ||
          status === 504;

        if (!isTemporaryError || attempt === MAX_RETRIES) {
          throw error;
        }

        const delay = attempt * 2000;

        console.log(
          `Temporary Gemini error. Retrying in ${delay / 1000} seconds...`,
        );

        await sleep(delay);
      }
    }
  } catch (error) {
    console.error("Gemini error:", error);

    const status = error.status || error.statusCode;

    if (status === 503) {
      return res.status(503).json({
        error: "Gemini is temporarily busy. Please try again in a few seconds.",
      });
    }

    if (status === 429) {
      return res.status(429).json({
        error:
          "Gemini request limit reached. Please wait a moment and try again.",
      });
    }

    if (status === 401 || status === 403) {
      return res.status(500).json({
        error:
          "Gemini authentication failed. Please check the API key in Render.",
      });
    }

    res.status(500).json({
      error: "Gemini API request failed.",
      details: error.message,
    });
  }
});

const server = app.listen(PORT, () => {
  console.log(`AI IDE Gemini backend running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("SERVER ERROR:", error);
});
