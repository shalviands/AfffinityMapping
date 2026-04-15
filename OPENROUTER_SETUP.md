# OpenRouter Setup Guide

## What is OpenRouter?
OpenRouter is a single API that gives you access to 300+ AI models from Anthropic,
Google, Meta, Mistral, OpenAI and more — through one endpoint, one API key, one bill.

## Why INCUBX uses OpenRouter
Instead of maintaining separate API keys and SDKs for Claude, Gemini, and GPT,
every AI call in INCUBX goes to one endpoint:
  POST https://openrouter.ai/api/v1/chat/completions

Switching models = changing one environment variable. No code changes.

## Getting your free API key (2 minutes)
1. Go to openrouter.ai
2. Click Sign Up — use Google or GitHub login
3. Go to Keys → Create Key
4. Copy the key (starts with sk-or-)
5. Paste into your .env: VITE_OPENROUTER_API_KEY=sk-or-your-key

No credit card required. Free models work immediately.

## Free models available (as of 2025)
These are completely free — $0 cost — available on your free account:

| Model | ID | Best for |
|---|---|---|
| Gemma 3 27B | google/gemma-3-27b-it:free | JSON extraction, clustering |
| Llama 3.3 70B | meta-llama/llama-3.3-70b-instruct:free | Writing synthesis |
| GPT-OSS 20B | openai/gpt-oss-20b:free | Structured outputs |
| Auto router | openrouter/free | Auto-picks best free model |

Free tier rate limits: 20 requests/minute, 200 requests/day per model.
For a typical affinity session: ~7 requests total = plenty of headroom.

## Upgrading when ready
Add $5 credit to your OpenRouter account.
At Gemini 2.0 Flash Lite pricing ($0.075/M input tokens):
- A 45-minute interview transcript ≈ 3,000 tokens input
- Cost per session ≈ $0.0003 (less than ₹0.03)
- $5 credit covers approximately 16,000 sessions

## Checking usage
openrouter.ai → Activity — see every request, model used, tokens, cost.
