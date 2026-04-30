import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ text: 'Method Not Allowed' });
  }

  try {
    const { url } = req.body;

    // The Server makes the request to Cobalt, bypassing CORS
    const response = await axios.post('https://api.cobalt.tools/api/json', {
      url: url,
      vQuality: '1080',
      isAudioOnly: false,
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
    return res.status(error.response?.status || 500).json(
      error.response?.data || { text: 'Internal Server Error' }
    );
  }
}
