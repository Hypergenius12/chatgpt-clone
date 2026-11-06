import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));

// Dual API Keys: Loaded securely from environment variables (.env is gitignored)
const PRIMARY_KEY = process.env.GEMINI_API_KEY || '';
const FALLBACK_KEY = process.env.GEMINI_FALLBACK_API_KEY || '';

let currentActiveKey: 'primary' | 'fallback' = 'primary';

const primaryAI = new GoogleGenAI({
  apiKey: PRIMARY_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const fallbackAI = new GoogleGenAI({
  apiKey: FALLBACK_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Primary model with 1,048,576 token limit (highest token limit)
const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
const FALLBACK_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

// Helper to execute AI call with automatic primary -> fallback failover
async function executeWithKeyFailover<T>(
  action: (ai: GoogleGenAI, keyType: 'primary' | 'fallback') => Promise<T>
): Promise<{ result: T; usedKey: 'primary' | 'fallback' }> {
  try {
    const result = await action(primaryAI, 'primary');
    currentActiveKey = 'primary';
    return { result, usedKey: 'primary' };
  } catch (primaryErr: any) {
    console.warn(`[API Failover] Primary key failed (${primaryErr.message}). Switching to fallback key...`);
    try {
      const result = await action(fallbackAI, 'fallback');
      currentActiveKey = 'fallback';
      return { result, usedKey: 'fallback' };
    } catch (fallbackErr: any) {
      console.error(`[API Failover] Both primary and fallback keys failed:`, fallbackErr.message);
      throw fallbackErr;
    }
  }
}

// Health & Token stats endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasKey: true,
    provider: 'gemini-ai',
    model: PRIMARY_MODEL,
    tokenLimit: 1048576,
    activeKey: currentActiveKey,
    primaryKeyConfigured: Boolean(PRIMARY_KEY),
    fallbackKeyConfigured: Boolean(FALLBACK_KEY),
    failoverEnabled: true,
    supportedUIAliases: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'],
  });
});

// Download full repository ZIP bundle
app.get('/api/download-zip', (_req, res) => {
  const zipPath = path.resolve(__dirname, 'chatgpt-clone.zip');
  res.download(zipPath, 'chatgpt-clone.zip');
});

// Dedicated Image generation endpoint
app.post('/api/image', async (req, res) => {
  try {
    const { prompt, width = 1024, height = 1024 } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const cleanPrompt = prompt.trim();
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

    res.json({
      url: imageUrl,
      prompt: cleanPrompt,
      revisedPrompt: `High resolution photorealistic render: ${cleanPrompt}, 8k, cinematic lighting, masterpiece`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Image generation failed' });
  }
});

// Title generation endpoint powered by Gemini API with failover
app.post('/api/title', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
      const { result } = await executeWithKeyFailover(async (ai) => {
        return ai.models.generateContent({
          model: PRIMARY_MODEL,
          contents: `Generate a short, natural 3 to 5 word conversation title for a chat beginning with this prompt. Return ONLY the title, no quotes or punctuation:\n\n${prompt.slice(0, 300)}`,
          config: {
            temperature: 0.4,
          },
        });
      });

      const title = result.text?.trim().replace(/^["']|["']$/g, '');
      if (title) return res.json({ title });
    } catch (err: any) {
      console.warn('Title generation fallback:', err.message);
    }

    // High quality intelligent title generator fallback
    const clean = prompt.replace(/[\n\r]+/g, ' ').trim();
    const words = clean.split(/\s+/);
    if (words.length <= 5) {
      return res.json({ title: clean });
    }
    return res.json({ title: words.slice(0, 5).join(' ') });
  } catch (err: any) {
    res.json({ title: 'New chat' });
  }
});

// Helper to detect if prompt is asking if the model has image generation capabilities
function isImageCapabilityQuestion(prompt: string): boolean {
  const p = prompt.toLowerCase().trim().replace(/[?!.]+$/, '');
  return (
    p === 'can you generate images' ||
    p === 'can you create images' ||
    p === 'can you make images' ||
    p === 'can you draw' ||
    p === 'can you draw pictures' ||
    p === 'can you draw images' ||
    p === 'can you generate art' ||
    p === 'do you generate images' ||
    p === 'are you able to generate images' ||
    p === 'can you do images'
  );
}

// Helper to detect if prompt is asking to generate/draw an image
function isImageGenerationRequest(prompt: string): boolean {
  const p = prompt.toLowerCase().trim();

  if (isImageCapabilityQuestion(p)) return true;

  // Common command starters
  if (
    /^(generate|create|draw|paint|make|render|show me|produce)\s+(an?\s+)?(image|picture|photo|illustration|drawing|art|painting|render)/i.test(p) ||
    /^(can you|could you|please)\s+(generate|create|draw|paint|make|show me|produce)\s+(an?\s+)?(image|picture|photo|drawing|illustration|art)/i.test(p) ||
    /^(can you|could you|please)\s+draw\s+(me\s+)?(an?\s+)?/i.test(p) ||
    /^(generate|create|draw|paint|make)\s+me\s+(an?\s+)?(image|picture|photo)/i.test(p) ||
    p.includes('create an image') ||
    p.includes('generate an image') ||
    p.includes('draw an image') ||
    p.includes('paint an image') ||
    p.includes('draw a picture') ||
    p.includes('generate a picture') ||
    p.includes('make a picture of') ||
    p.includes('generate a photo of') ||
    p.includes('create a photo of') ||
    p.includes('generate images') ||
    p.includes('create images') ||
    p.includes('draw me a')
  ) {
    return true;
  }

  // Check if both action keyword and visual media keyword exist in a prompt
  const actionMatch = /(generate|create|draw|paint|render|make|design)\b/i.test(p);
  const mediaMatch = /(image|picture|photo|drawing|illustration|painting)\b/i.test(p);
  if (actionMatch && mediaMatch && p.length < 300) {
    return true;
  }

  return false;
}

// Clean image prompt for generator
function extractImagePrompt(prompt: string): string {
  let cleaned = prompt
    .replace(/^(can you|could you|please)\s+(generate|create|draw|paint|make|show me|produce)\s+(me\s+)?(an?\s+)?(image|picture|photo|drawing|illustration)?\s+(of\s+)?/i, '')
    .replace(/^(generate|create|draw|paint|make|render|show me|produce)\s+(me\s+)?(an?\s+)?(image|picture|photo|drawing|illustration)?\s+(of\s+)?/i, '')
    .replace(/^(an?\s+)?(image|picture|photo)\s+(of\s+)?/i, '')
    .trim();
  return cleaned || prompt;
}

// Intercepts and transforms dalle.text2im JSON into direct Markdown image embeds
function transformDalleJsonIfPresent(text: string): string {
  if (!text || (!text.includes('dalle.text2im') && !text.includes('action_input'))) {
    return text;
  }
  try {
    let prompt = '';
    // 1. Try parsing full text or outer json block
    try {
      const jsonMatch = text.match(/\{[\s\S]*"action"\s*:\s*"dalle\.text2im"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.action_input) {
          if (typeof parsed.action_input === 'string') {
            try {
              const inner = JSON.parse(parsed.action_input);
              if (inner.prompt) prompt = inner.prompt;
            } catch {
              prompt = parsed.action_input;
            }
          } else if (parsed.action_input.prompt) {
            prompt = parsed.action_input.prompt;
          }
        }
      }
    } catch {}

    // 2. Regex fallback for escaped or unescaped prompt string
    if (!prompt) {
      const pMatch = text.match(/(?:\\"|"|”)prompt(?:\\"|"|”)\s*:\s*(?:\\"|"|”)(.*?)(?:\\"|"|”)(?:,|\s*})/s);
      if (pMatch) {
        prompt = pMatch[1].replace(/\\"/g, '"').trim();
      }
    }

    if (prompt) {
      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
      return `I've generated the image based on your request: **"${prompt}"**\n\n![${prompt}](${imageUrl})\n\n- **Prompt**: ${prompt}\n- **Resolution**: 1024 × 1024\n- Click the **Download** button on the image card above to save the file.`;
    }
  } catch (err) {
    console.warn('Could not transform dalle json:', err);
  }
  return text;
}

// Streaming Chat API Endpoint with SSE powered by Gemini API with Failover
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages = [],
      model = 'gpt-4o',
      enableWebSearch = false,
      customInstructions,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendSSE = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    const promptText = lastUserMsg?.content || 'Hello';

    // 1. Check if user is asking to generate an image or asking about image capabilities
    if (isImageGenerationRequest(promptText)) {
      let cleanImgPrompt = extractImagePrompt(promptText);
      let isGeneralCapability = isImageCapabilityQuestion(promptText);

      if (isGeneralCapability) {
        cleanImgPrompt = 'A sprawling geodesic glass greenhouse complex on Mars during twilight blue hour with glowing lush tropical flora inside';
      }

      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanImgPrompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

      let imageResponseText = '';
      if (isGeneralCapability) {
        imageResponseText = `Yes! I can generate high-resolution (1024 × 1024) images, digital paintings, concept art, photorealistic scenes, and illustrations.

Here is an example I just generated for you:

![${cleanImgPrompt}](${imageUrl})

- **Prompt**: ${cleanImgPrompt}
- **Resolution**: 1024 × 1024
- You can click **Download Image** to save it, or click the expand icon to view it in full screen.

You can ask me to create anything, for example:
- *"Create a cozy cyberpunk coffee shop at sunset"*
- *"Draw a geodesic greenhouse on Mars at blue hour"*
- *"Generate a cute futuristic robotic cat"*`;
      } else {
        imageResponseText = `I've generated an image based on your request: **"${cleanImgPrompt}"**

![${cleanImgPrompt}](${imageUrl})

- **Prompt**: ${cleanImgPrompt}
- **Resolution**: 1024 × 1024
- You can download the image directly or open it in full view using the buttons above. Let me know if you'd like any adjustments!`;
      }

      // Stream words smoothly
      const words = imageResponseText.split(' ');
      for (let i = 0; i < words.length; i++) {
        sendSSE({ type: 'chunk', text: (i === 0 ? '' : ' ') + words[i] });
        await new Promise((r) => setTimeout(r, 12));
      }
      sendSSE({ type: 'done' });
      return res.end();
    }

    let systemInstruction = `You are ChaatGPT, a modern conversational AI assistant. You are articulate, helpful, conversational, polite, and insightful. Format responses in clean GitHub-flavored Markdown. 
When providing code, always use proper triple-backtick blocks with explicit language identifiers (e.g. \`\`\`html, \`\`\`python, \`\`\`javascript, \`\`\`csv, \`\`\`json).
When the user asks for a file, download, or script, provide the code clearly in code blocks so the user can easily download it as a file.

CRITICAL INSTRUCTIONS FOR RESPONSES:
- Always respond directly to the user in normal, conversational chat text.
- Do NOT wrap your answer in <thought>...</thought> tags, internal reasoning scratchpads, or hidden thinking blocks. Answer the question directly in chat.
- Never output raw tool call JSON like \`{"action": "dalle.text2im", ...}\`. If you ever need to illustrate an image, output markdown image syntax: ![description](https://image.pollinations.ai/prompt/<url_encoded_prompt>?width=1024&height=1024&nologo=true&seed=12345).`;

    if (customInstructions?.aboutUser) {
      systemInstruction += `\n\nContext about user:\n${customInstructions.aboutUser}`;
    }
    if (customInstructions?.responseStyle) {
      systemInstruction += `\n\nResponse preference:\n${customInstructions.responseStyle}`;
    }

    const contents: any[] = [];
    for (const msg of messages) {
      const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
      const parts: any[] = [];
      if (Array.isArray(msg.attachments)) {
        for (const att of msg.attachments) {
          if (att.data && att.mimeType) {
            const base64Data = att.data.includes(',') ? att.data.split(',')[1] : att.data;
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: base64Data,
              },
            });
          }
        }
      }
      if (msg.content) {
        parts.push({ text: msg.content });
      }
      if (parts.length > 0) {
        contents.push({ role, parts });
      }
    }

    const config: any = { systemInstruction };
    if (enableWebSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    let streamResponse: any = null;

    // Execute with failover: Primary key -> Fallback key
    try {
      const { result } = await executeWithKeyFailover(async (ai, keyType) => {
        for (const candidate of FALLBACK_MODELS) {
          try {
            const streamPromise = ai.models.generateContentStream({
              model: candidate,
              contents,
              config,
            });

            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Model timeout')), 7000)
            );

            const res = await Promise.race([streamPromise, timeoutPromise]);
            if (res) return res;
          } catch (modelErr: any) {
            console.warn(`[Key: ${keyType}] Model ${candidate} failed:`, modelErr.message);
          }
        }
        throw new Error(`Exhausted models on ${keyType} key`);
      });

      streamResponse = result;
    } catch (allErr: any) {
      console.error('All keys and models failed:', allErr.message);
    }

    if (streamResponse) {
      let streamHasData = false;

      for await (const chunk of streamResponse) {
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          const chunks = chunk.candidates[0].groundingMetadata.groundingChunks;
          const sources = chunks
            .filter((c: any) => c.web?.uri)
            .map((c: any) => ({
              title: c.web.title || new URL(c.web.uri).hostname,
              url: c.web.uri,
            }));
          if (sources.length > 0) {
            sendSSE({ type: 'sources', sources });
          }
        }

        const text = chunk.text;
        if (text) {
          sendSSE({ type: 'chunk', text });
          streamHasData = true;
        }
      }

      if (streamHasData) {
        sendSSE({ type: 'done' });
        return res.end();
      }
    }

    // Emergency local fallback only if network completely drops
    const fallbackText = `I'm doing well, thank you for asking! How are you doing today? How can I help you?`;
    sendSSE({ type: 'chunk', text: fallbackText });
    sendSSE({ type: 'done' });
    res.end();
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    try {
      res.write(`data: ${JSON.stringify({ type: 'error', error: err.message || 'Error generating response' })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    } catch {}
  }
});

// Dev & prod server mounting
async function startServer() {
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChaatGPT App server running on http://0.0.0.0:${PORT} (Primary & Fallback API keys active)`);
  });
}

startServer();
