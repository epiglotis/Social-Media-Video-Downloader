// src/pages/api/youtubeVideos.js
import youtubedl from 'youtube-dl-exec';

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parametresi eksik' });
    }

    console.log('Fetching YouTube video info for URL:', url);

    // yt-dlp ile video bilgilerini al
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot']
    });

    console.log('Video info retrieved:', info.title);

    // Formatları filtrele - m3u8 (HLS) formatlarını atla, sadece direkt indirilebilir olanları al
    const formats = (info.formats || [])
      .filter(format => 
        format.vcodec !== 'none' && 
        format.acodec !== 'none' && 
        (format.ext === 'mp4' || format.ext === 'webm') &&
        format.protocol !== 'm3u8' &&
        format.protocol !== 'm3u8_native' &&
        !format.url?.includes('.m3u8')
      )
      .sort((a, b) => (b.height || 0) - (a.height || 0))
      .slice(0, 5)
      .map(format => {
        // Kalite bilgisini düzgün oluştur
        let quality = format.format_note || format.quality || 'Bilinmiyor';
        if (format.height && !quality.includes('p')) {
          quality = `${format.height}p`;
        }
        
        return {
          formatId: format.format_id,
          quality: quality,
          ext: format.ext,
          filesize: format.filesize,
          height: format.height,
          hasAudio: format.acodec !== 'none',
          hasVideo: format.vcodec !== 'none',
          protocol: format.protocol,
        };
      });

    // Eğer birleşik format yoksa, sadece video formatlarını al (m3u8 olmayan)
    if (formats.length === 0) {
      const videoFormats = (info.formats || [])
        .filter(format => 
          format.vcodec !== 'none' && 
          (format.ext === 'mp4' || format.ext === 'webm') &&
          format.protocol !== 'm3u8' &&
          format.protocol !== 'm3u8_native' &&
          !format.url?.includes('.m3u8')
        )
        .sort((a, b) => (b.height || 0) - (a.height || 0))
        .slice(0, 3)
        .map(format => {
          // Kalite bilgisini düzgün oluştur
          let quality = format.format_note || format.quality || 'Bilinmiyor';
          if (format.height && !quality.includes('p')) {
            quality = `${format.height}p`;
          }
          
          return {
            formatId: format.format_id,
            quality: quality,
            ext: format.ext,
            filesize: format.filesize,
            height: format.height,
            hasAudio: format.acodec !== 'none',
            hasVideo: format.vcodec !== 'none',
            protocol: format.protocol,
          };
        });
      
      formats.push(...videoFormats);
    }

    if (formats.length === 0) {
      return res.status(404).json({ 
        error: 'Bu video için uygun format bulunamadı' 
      });
    }

    // Video detaylarını döndür
    res.status(200).json({
      title: info.title,
      duration: formatDuration(info.duration || 0),
      thumbnail: info.thumbnail,
      author: info.uploader || info.channel || 'Bilinmiyor',
      videoId: info.id,
      youtubeUrl: info.webpage_url || url,
      formats: formats,
    });

  } catch (error) {
    console.error('Error fetching YouTube video:', error);
    
    if (error.message.includes('unavailable')) {
      return res.status(404).json({ error: 'Video bulunamadı veya erişilemiyor' });
    }
    
    if (error.message.includes('private')) {
      return res.status(403).json({ error: 'Bu video özel ve indirilemez' });
    }

    res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
  }
}
