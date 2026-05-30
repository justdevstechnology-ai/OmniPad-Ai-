import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Boilerplate to handle directory paths with ES Modules ("type": "module")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 SERVE FRONTEND: This tells the server to hand over your frontend files (index.html, app.js, etc.)
app.use(express.static(__dirname));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
    // Extracted history alongside your prompt text
    const { prompt, history } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Context framework prompt cannot be blank." });
    }

    try {
        // 🧠 MEMORY PIPELINE: Map incoming cross-chat array into structure Gemini expects
        let contentsPayload = [];
        if (history && history.length > 0) {
            contentsPayload = history.map(item => ({
                role: item.role === 'model' ? 'model' : 'user',
                parts: [{ text: item.parts[0].text }]
            }));
        }
        
        // Append the latest user prompt right at the end of the history stack
        contentsPayload.push({ role: 'user', parts: [{ text: prompt }] });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contentsPayload, 
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error("OmniPad Generation Error:", error);
        res.status(500).json({ error: "Internal generation network error occurred." });
    }
});

// Wildcard route to guarantee mobile users reloading pages always hit index.html cleanly
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Tenora server core deployed live on port ${PORT}`));
