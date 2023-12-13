// pages/api/twitterVideos.js
import getTwitterMedia from 'get-twitter-media';

export default async function handler(req, res) {
  try {
    const media = await getTwitterMedia(
      'https://twitter.com/CursedVideos/status/1687071264848879616?s=20',
      {
        buffer: true,
      }
    );
    res.status(200).json({ media });
  } catch (error) {
    console.error('Error fetching Twitter media:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
