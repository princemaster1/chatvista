// backend/src/services/openai.js
const axios = require('axios');

async function callOpenAI(prompt, apiKey, opts = {}) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const body = {
    model: opts.model || 'gpt-4o-mini',
    messages: [{ role: 'system', content: opts.system || 'You are ChatVista assistant.' }, { role: 'user', content: prompt }],
    max_tokens: opts.max_tokens || 300,
    temperature: opts.temperature ?? 0.2
  };
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
  try {
    const res = await axios.post(url, body, { headers });
    return res.data;
  } catch(err){
    console.error('OpenAI request failed', err.response ? err.response.data : err.message);
    throw err;
  }
}

module.exports = { callOpenAI };
