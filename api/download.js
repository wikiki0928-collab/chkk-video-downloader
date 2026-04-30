import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ text: 'Method Not Allowed' });
  }

  try {
    const { url } = req.body;

    // Trying a public instance, but most are now protected by Turnstile (JWT)
    const response = await axios.post('https://cobalt-api.meowing.de/', {
      url: url,
      videoQuality: '1080',
      filenameStyle: 'pretty'
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.response?.data || error.message);
    
    // Check if it's the bot protection error
    if (error.response?.data?.error?.code === 'error.api.auth.jwt.missing') {
      return res.status(403).json({ 
        text: 'The public downloading server is currently blocking requests to prevent bots (Turnstile Protection). Please try again later or host a private backend.' 
      });
    }

    return res.status(error.response?.status || 500).json(
      error.response?.data || { text: 'Internal Server Error: The parsing server is currently unavailable.' }
    );
  }
}
