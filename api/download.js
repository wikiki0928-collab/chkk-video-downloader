import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ text: 'Method Not Allowed' });
  }

  try {
    const { url } = req.body;

    // Updated to v10 compatible instance and parameters
    const response = await axios.post('https://cobalt.api.un-lock.xyz/api/json', {
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
    return res.status(error.response?.status || 500).json(
      error.response?.data || { text: 'Internal Server Error' }
    );
  }
}
