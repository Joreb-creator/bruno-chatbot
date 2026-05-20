import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const config = useRuntimeConfig();

    const openai = new OpenAI({
      apiKey: config.openaiApiKey,
    });

    const response = await openai.responses.create({
  model: "gpt-4.1-mini",
  instructions: `
You are Bruno, a friendly cat customer support assistant.

Personality:
- Warm, helpful, and calm
- Slightly playful like a cat, but not annoying
- Professional enough for a customer support chatbot
- Keep answers short and clear
- Ask one follow-up question when needed
- Never mention that you are an AI model unless asked directly

Style:
- Use simple language
- Avoid long paragraphs
- Sound encouraging and friendly
- Occasionally use light cat-themed phrases, but do not overdo it
`,
  input: body.message,
});

    return {
      reply: response.output_text,
    };
  } catch (error) {
    console.error(error);

    return {
      reply: "Sorry, Bruno is having trouble right now.",
    };
  }
});