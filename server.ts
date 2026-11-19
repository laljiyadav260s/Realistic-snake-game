import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import 'dotenv/config';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint: Gemini Herpetologist Serpent Insights
app.post('/api/gemini/serpent-insight', async (req, res) => {
  try {
    const {
      speciesName,
      scientificName,
      biomeName,
      lengthMeters,
      preyCaught,
      calories,
      topPrey,
      digestiveCount,
    } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an acclaimed field herpetologist and apex reptile behavioral scientist.
Analyze the following telemetry from an active serpent hunt in our realistic biological simulation:
- Serpent: ${speciesName || 'Emerald Tree Boa'} (${scientificName || 'Corallus caninus'})
- Substrate / Biome: ${biomeName || 'Mossy Rainforest'}
- Specimen Length: ${(Number(lengthMeters) || 1.8).toFixed(2)} meters
- Total Prey Captured: ${preyCaught || 0} (${calories || 0} kcal assimilated)
- Active Digestive Bulges: ${digestiveCount || 0} prey items undergoing peristalsis
- Target Quarry: ${topPrey || 'Field mice and tree frogs'}

Return a JSON object with this exact schema:
{
  "tacticalAssessment": "2 concise sentences evaluating this species' predatory efficiency and how its real anatomical traits (e.g. thermal infrared pits, keeled scales, constriction vs venom) are used in this environment.",
  "metabolicAnalysis": "1-2 sentences on how the snake's digestive tract handles the swallowed meals, scale expansion, and energy reserves.",
  "predatorTip": "1 tactical tip for the player to stalk agile field mice or hopping tree frogs more effectively.",
  "biologicalFact": "1 fascinating, verified biological fact about this serpent species."
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate AI insights';
    console.error('Gemini Error:', message);
    res.status(500).json({ error: message });
  }
});

// Start Express server and mount Vite dev middlewares
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Serpent Simulator server active on http://0.0.0.0:${port}`);
  });
}

startServer();
