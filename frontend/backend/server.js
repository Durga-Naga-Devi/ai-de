require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "AI IDE backend is running!",
  });
});

// AI chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, files } = req.body;

    console.log("User message:", message);

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing");

      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured",
      });
    }

    // Convert the files object into readable text
    let codeContext = "";

    if (files && typeof files === "object") {
      for (const [filename, file] of Object.entries(files)) {
        codeContext += `\n\n--- ${filename} ---\n`;
        codeContext += file?.code || "";
      }
    }

    const prompt = `
You are an AI coding assistant inside an AI IDE.

The user asked:

${message}

Here is the user's project code:

${codeContext}

Give a clear and helpful answer.
If the user asks to explain code, explain it in simple language.
If they ask to fix code, provide the corrected code.
`;

    console.log("Sending request to OpenAI...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI coding assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "I couldn't generate a response.";

    console.log("AI response received");

    res.json({
      reply,
    });
  } catch (error) {
    console.error("OpenAI/backend error:", error);

    res.status(500).json({
      error: error.message || "AI backend error",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI IDE backend running on port ${PORT}`);
});
