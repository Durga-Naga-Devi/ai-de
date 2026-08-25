const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.json({
    message: "AI IDE backend is running!",
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, files } = req.body;

    console.log("User message:", message);

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    let projectCode = "";

    if (files) {
      projectCode = Object.entries(files)
        .map(([fileName, fileData]) => {
          return `
===== ${fileName} =====
${fileData.code || ""}
`;
        })
        .join("\n");
    }

    const prompt = `
You are an AI coding assistant inside an AI IDE.

The user asked:

${message}

Here is the user's project code:

${projectCode}

Analyze the code and give a clear, useful answer.

If the user asks you to explain the code, explain what the code does in simple language.

If the user asks for a bug fix, identify the problem and provide corrected code when appropriate.

If the user asks for improvements, suggest practical improvements.
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const reply = response.output_text;

    res.json({
      reply: reply,
    });
  } catch (error) {
    console.error("OpenAI error:", error);

    res.status(500).json({
      error: "AI backend error",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AI IDE backend running on port ${PORT}`);
});
