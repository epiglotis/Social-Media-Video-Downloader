import {
  getVideoInfo,
  formatDuration,
  buildYoutubeQualities,
} from '../../lib/ytdlp';

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parametresi eksik' });
    }

    if (!/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url)) {
      return res.status(400).json({ error: 'Geçerli bir YouTube URL\'si girin' });
    }

    const info = await getVideoInfo(url);
    const formats = buildYoutubeQualities(info);

    if (formats.length === 0) {
      return res.status(404).json({
        error: 'Bu video için uygun format bulunamadı',
      });
    }

    return res.status(200).json({
      title: info.title,
      duration: formatDuration(info.duration || 0),
      thumbnail: info.thumbnail,
      author: info.uploader || info.channel || 'Bilinmiyor',
      videoId: info.id,
      youtubeUrl: info.webpage_url || url,
      formats,
    });
  } catch (error) {
    console.error('Error fetching YouTube video:', error);
    const message = error?.message || String(error);

    if (/unavailable|not available/i.test(message)) {
      return res.status(404).json({ error: 'Video bulunamadı veya erişilemiyor' });
    }
    if (/private/i.test(message)) {
      return res.status(403).json({ error: 'Bu video özel ve indirilemez' });
    }

    return res.status(500).json({ error: 'Sunucu hatası: ' + message });
  }
}
