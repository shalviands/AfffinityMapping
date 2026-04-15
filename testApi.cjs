const key = process.env.GEMINI_API_KEY;

async function test() {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Return a simple JSON array: [{"a":1}]' }] }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
      })
    });
    const d = await response.json();
    console.log(JSON.stringify(d, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
