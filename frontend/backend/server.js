require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, files } = req.body;

    const projectCode = files
      ? Object.entries(files)
          .map(([fileName, fileData]) => {
            return `
===== ${fileName} =====
${fileData.code || ""}
`;
          })
          .join("\n")
      : "No project files were provided.";

    const prompt = `
You are the AI coding assistant inside an AI IDE.

The user asked:
${message}

Here is the user's complete project:

${projectCode}

Give a helpful coding answer.
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    res.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error("OpenAI error:", error);

    res.status(500).json({
      error: "AI backend error",
      details: error.message,
    });
  }
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
