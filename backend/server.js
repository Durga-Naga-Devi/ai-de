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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
        error: "Gemini API key is not configured.",
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
    });

    const prompt = `
You are the AI coding assistant inside a professional AI IDE.

You must analyze ONLY the code provided below.

FILE NAME:
${fileName || "Unknown"}

CODE:
--------------------
${code || "No code was provided."}
--------------------

USER REQUEST:
${message}

IMPORTANT DEBUGGING RULES:

1. Analyze the EXACT code provided.
2. Never invent missing code, variables, imports, exports, functions, or errors.
3. Do not assume something is missing unless it is actually missing from the provided code.
4. Before claiming a bug, verify that the bug actually exists in the provided code.
5. If the code is already correct, clearly say:
   "I don't see a bug in the provided code."
6. If there is a bug, explain:
   - What the actual problem is.
   - Where it occurs.
   - Why it causes a problem.
   - How to fix it.
7. When providing corrected code, preserve working parts of the original code.
8. Do not remove valid code just to create a correction.
9. For React code, check imports, exports, JSX syntax, hooks, state, props, event handlers, and component structure carefully.
10. If the user's request is "debug", prioritize finding REAL bugs rather than suggesting general improvements.
11. If there is no actual error, do not manufacture one.

RESPONSE STYLE:

For debugging, use this structure:

### Debug Result

**Problem:** 
State the real problem, or say that no bug was found.

**Why:**
Explain the reason clearly.

**Fix:**
Provide corrected code only if a real fix is necessary.

**Additional Notes:**
Mention any optional improvements separately from actual bugs.

For explanation requests, explain the code clearly.

For code-generation requests, provide complete usable code.

For improvement requests, distinguish between required fixes and optional improvements.
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

        const temporaryError =
          status === 429 ||
          status === 500 ||
          status === 502 ||
          status === 503 ||
          status === 504;

        if (!temporaryError || attempt === MAX_RETRIES) {
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

    return res.status(500).json({
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
