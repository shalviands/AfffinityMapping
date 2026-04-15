# Bhashini Setup

## What is Bhashini?
Bhashini is the National Language Translation Mission's API platform built by the Government of India. It provides robust Automatic Speech Recognition (ASR), translation, and language identification tuned specifically for Indian languages, dialects, and code-switching (e.g., Hinglish).

## Registration and Setup
1. **Sign Up**: Register on the Bhashini developer portal at https://bhashini.gov.in/ulca/model/api-info
2. **API Key Generation**: Once logged in, generate an API access key.
3. **Values required**: Secure your `userId`, `apiKey` and `pipelineId`. Insert these into your `.env` file under `VITE_BHASHINI_USER_ID`, `VITE_BHASHINI_API_KEY`, and `VITE_BHASHINI_PIPELINE_ID`.

## Pipeline Configuration
We use Bhashini's ASR + Translation pipeline so regional language speech is immediately output as English transcript text.

## Supported Languages
- Hindi (`hi`)
- Telugu (`te`)
- Tamil (`ta`)
- Kannada (`kn`)
- Marathi (`mr`)
- English (`en`)

## Testing and Fallback Validation
- When making audio requests, log the response `confidence` score.
- **Whisper Fallback**: If the pipeline yields a confidence score `< 0.70`, the system automatically reverts the segment to OpenAI Whisper to ensure reliability. You must configure `VITE_OPENAI_API_KEY` for this fallback to operate gracefully. Ensure logging traces show which provider transcribed each segment.

## Troubleshooting
- *API Limit Exceeded*: Monitor usage in the Bhashini dashboard; you may need to apply for quota upgrades for extended batch processing.
- *Pipeline ID Misconfigured*: Ensure the Pipeline ID specifically corresponds to `Audio -> Translation -> Text` formats.
