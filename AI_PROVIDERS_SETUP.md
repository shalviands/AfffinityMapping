# AI Providers Setup

The platform uses a model-agnostic API service (`src/services/ai/index.js`) to parse and synthesize transcriptions, extract sentiment, and construct semantic representations. 

## Model-Agnostic Routing
By dynamically reading `AI_CONFIG.provider`, the system seamlessly shifts traffic between specific endpoint templates (e.g., Claude or Gemini). To change the primary provider, simply override the `VITE_AI_PROVIDER` flag in your `.env` configuration file.

## Claude Configuration
- **Model**: `claude-sonnet-4-6` or similar.
- **Provider URL**: Anthropic API (`https://api.anthropic.com/v1/messages`).
- **Keys**: Configure using `VITE_CLAUDE_API_KEY`.
- **Usage constraints**: Recommended as the default choice due to strong reasoning semantics and JSON formatting adherence. Ensure account limits accommodate typical token extraction sequences (≈ 4,000 output tokens max).

## Gemini Configuration
- **Model**: `gemini-1.5-pro`
- **Provider URL**: Generative Language API (`https://generativelanguage.googleapis.com/v1beta/models`).
- **Keys**: Add `VITE_GEMINI_API_KEY`.

## Token Cost Estimates
- Assuming a 60-minute interview yielding ≈ 8,000 input tokens and outputting ≈ 1,500 token structural maps.
- Each full evaluation costs approximately $0.05 to $0.10.

## Extending Providers
1. Create a new service under `src/services/ai/{provider}.service.js` mirroring the parameter structure `{ text, usage }`.
2. Add the case logic router to `src/services/ai/index.js`.
3. Modify the `.env` template to accommodate the specific keys.
