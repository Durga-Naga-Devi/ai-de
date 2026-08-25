const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "AI IDE backend is running!",
  });
});

// AI Chat route
app.post("/api/chat", async (req, res) => {
  try {
    const { message, code } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const prompt = `
You are an AI coding assistant inside an AI IDE.

User request:
${message}

Code:
${code || "No code provided"}

Give a clear and useful answer. If the user asks to explain code,
explain what the code does step by step.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: prompt,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);

      return res.status(response.status).json({
        error: data.error?.message || "OpenAI API error",
      });
    }

    res.json({
      reply: data.output_text,
    });
  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "Something went wrong on the backend",
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI IDE backend running on port ${PORT}`);
});
