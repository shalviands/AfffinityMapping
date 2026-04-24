// Use global fetch

const API_KEY = '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';
const MODEL = 'google/gemma-3-27b-it:free';

async function testExtraction() {
  const systemPrompt = `RETURN ONLY A VALID JSON OBJECT with a "cards" key. {"cards": [{"insight": "test"}]}`;
  const userPrompt = `Extract from: "I really love the new UI, but the payment is slow."`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    console.log('--- RAW RESPONSE ---');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0]) {
        console.log('--- CONTENT ---');
        console.log(data.choices[0].message.content);
    }
  } catch (e) {
    console.error('Test failed:', e);
  }
}

testExtraction();
