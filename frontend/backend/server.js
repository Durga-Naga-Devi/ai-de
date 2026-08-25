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

app.post("/api/chat", async (req, res) => {
  try {
    const { message, code } = req.body;

    console.log("User message:", message);

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: [
          {
            role: "system",
            content:
              "You are an AI coding assistant inside an AI IDE. Explain, debug, and improve code clearly.",
          },
          {
            role: "user",
            content: `User request:
${message}

Code:
${code || "No code provided"}`,
          },
        ],
      }),
    });

    const data = await response.json();

    console.log("OpenAI response status:", response.status);

    if (!response.ok) {
      console.error("OpenAI error:", data);

      return res.status(response.status).json({
        error: data.error?.message || "OpenAI API request failed",
      });
    }

    res.json({
      reply: data.output_text,
    });
  } catch (error) {
    console.error("Backend error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI IDE backend running on port ${PORT}`);
});
