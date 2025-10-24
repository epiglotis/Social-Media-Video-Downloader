// src/pages/api/downloadYoutube.js
import youtubedl from 'youtube-dl-exec';

export default async function handler(req, res) {
  try {
    const { url, formatId } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parametresi eksik' });
    }

    console.log('Downloading YouTube video:', url, 'format:', formatId);

    // Video bilgilerini al
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    });

    const title = info.title.replace(/[^\w\s-]/gi, '_'); // Dosya adı için temizle

    // Format seç - m3u8 olmayanları tercih et
    let format = info.formats.find(f => 
      f.format_id === formatId && 
      f.protocol !== 'm3u8' && 
      f.protocol !== 'm3u8_native' &&
      !f.url?.includes('.m3u8')
    );

    // Eğer seçilen format m3u8 ise veya bulunamadıysa, en iyi alternatifi bul
    if (!format) {
      format = info.formats
        .filter(f => 
          f.vcodec !== 'none' && 
          f.acodec !== 'none' &&
          f.protocol !== 'm3u8' &&
          f.protocol !== 'm3u8_native' &&
          !f.url?.includes('.m3u8')
        )
        .sort((a, b) => (b.height || 0) - (a.height || 0))[0];
    }

    if (!format || !format.url) {
      return res.status(404).json({ error: 'İndirme linki bulunamadı' });
    }

    // Video URL'sini döndür (client-side download için)
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      title: title,
      downloadUrl: format.url,
      filename: `${title}.${format.ext || 'mp4'}`,
      quality: format.format_note || `${format.height}p`,
      ext: format.ext
    });

  } catch (error) {
    console.error('Error downloading YouTube video:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
    }
  }
}
