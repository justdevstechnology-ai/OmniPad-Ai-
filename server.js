import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Context framework prompt cannot be blank." });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error("OmniPad Generation Error:", error);
        res.status(500).json({ error: "Internal generation network error occurred." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Tenora server core deployed live on port ${PORT}`));
