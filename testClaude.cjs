const key = process.env.ANTHROPIC_API_KEY;

async function test() {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 1000,
          messages: [{ role: 'user', content: 'Return a simple JSON array: [{"a":1}]' }]
      })
    });
    
    if (response.status !== 200) {
        console.log(`Failed with status: ${response.status}`);
        console.log(await response.text());
        return;
    }
    const d = await response.json();
    console.log(d.content[0].text);
  } catch (e) {
    console.error(e);
  }
}
test();
