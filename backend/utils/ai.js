const axios = require('axios');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemma-4-31b-it:free';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function askAI(message) {
  const apiKey = process.env.OPENROUTER_KEY;
  const content = (message || '').toString().trim();

  if (!content) return "Say something and I'll reply.";
  if (!apiKey) return "AI chat isn't configured on the server yet.";

  const fallbackChat =
    "I'm here and doing well. Tell me what you'd like to do today—chat with me, or ask for product suggestions (like “wireless headphones under $100”).";

  async function callOpenRouter() {
    return axios.post(
      OPENROUTER_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content:
              "You are a friendly shopping assistant for an e-commerce app. You ONLY do conversation. Do NOT recommend or list products. If the user asks for products, tell them to use the product suggestion feature.",
          },
          { role: 'user', content },
        ],
        temperature: 0.7,
        max_tokens: 250,
      },
      {
        timeout: 20000,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(process.env.OPENROUTER_SITE_URL ? { 'HTTP-Referer': process.env.OPENROUTER_SITE_URL } : {}),
          ...(process.env.OPENROUTER_APP_NAME ? { 'X-Title': process.env.OPENROUTER_APP_NAME } : {}),
        },
      }
    );
  }

  try {
    const resp = await callOpenRouter();

    const text = resp?.data?.choices?.[0]?.message?.content;
    const cleaned = (text || '').toString().trim();
    return cleaned || "I'm not sure what to say right now.";
  } catch (err) {
    const status = err?.response?.status;
    const msg =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      'OpenRouter request failed';

    console.error('[OpenRouter] askAI failed:', status || 'NO_STATUS', msg);

    if (status === 401 || status === 403) {
      return "AI chat isn't authorized on the server right now.";
    }
    if (status === 429) {
      // Quick retry with backoff to smooth bursts / strictmode double-requests
      await sleep(900);
      try {
        const resp2 = await callOpenRouter();
        const text2 = resp2?.data?.choices?.[0]?.message?.content;
        const cleaned2 = (text2 || '').toString().trim();
        return cleaned2 || fallbackChat;
      } catch (err2) {
        const status2 = err2?.response?.status;
        const msg2 =
          err2?.response?.data?.error?.message ||
          err2?.response?.data?.message ||
          err2?.message ||
          'OpenRouter retry failed';
        console.error('[OpenRouter] askAI retry failed:', status2 || 'NO_STATUS', msg2);
        return fallbackChat;
      }
    }
    if (status >= 500) {
      return "The chat service is having issues right now. Please try again shortly.";
    }

    return "Sorry, I can't chat right now.";
  }
}

module.exports = { askAI };

