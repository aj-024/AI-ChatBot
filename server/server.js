// server/server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

// ----------------- helpers -----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);      // directory: .../AI ChatBot/server
const staticDir  = path.join(__dirname, "..", "public");  // .../AI ChatBot/public
// -------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());

// 🌐 secure proxy for frontend
app.post("/chat", async (req, res) => {
  try {
    const { chatHistory } = req.body;

    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      `gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory })
    });

    const data = await apiRes.json();
    if (!apiRes.ok) throw new Error(data.error?.message || "Gemini error");

    res.json(data);                 // 👉 send Gemini’s reply back to browser
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini API failure" });
  }
});

// 🔗 serve your static frontend files
app.use(express.static(staticDir));
app.get("*", (_, res) => res.sendFile(path.join(staticDir, "index.html")));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server live on ${PORT}`));
