// src/pages/api/twitterVideos.js
import getTwitterMedia from 'get-twitter-media';

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'Missing URL parameter' });
    }

    const media = await getTwitterMedia(url, {
      buffer: true,
    });

    res.status(200).json({ media });
  } catch (error) {
    console.error('Error fetching Twitter media:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
