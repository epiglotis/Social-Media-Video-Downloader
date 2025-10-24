// src/pages/api/twitterVideos.js
import getTwitterMedia from 'get-twitter-media';

function normalizeTwitterUrl(url) {
  try {
    // URL'yi parse et
    const urlObj = new URL(url);
    
    // x.com'u twitter.com'a çevir
    if (urlObj.hostname === 'x.com' || urlObj.hostname === 'www.x.com') {
      urlObj.hostname = 'twitter.com';
    }
    
    // Query parametrelerini temizle (sadece pathname'i al)
    const cleanUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
    
    return cleanUrl;
  } catch (error) {
    // Eğer URL parse edilemezse, orijinali döndür
    return url;
  }
}

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parametresi eksik' });
    }

    // URL'yi normalize et
    const normalizedUrl = normalizeTwitterUrl(url);
    console.log('Original URL:', url);
    console.log('Normalized URL:', normalizedUrl);

    const media = await getTwitterMedia(normalizedUrl, {
      buffer: true,
    });

    console.log('Media response:', JSON.stringify(media, null, 2));

    // get-twitter-media paketinin found:false durumunu kontrol et
    if (!media || media.found === false) {
      return res.status(404).json({ 
        error: media?.error || "Bu tweet'te medya bulunamadı veya tweet erişilebilir değil" 
      });
    }

    // Media objesinin yapısını kontrol et
    if (media.media && Array.isArray(media.media)) {
      // Sadece video ve animated gif'leri filtrele
      const videos = media.media.filter(
        (item) => !item.type || item.type === 'video' || item.type === 'animated_gif'
      );
      
      if (videos.length > 0) {
        // get-twitter-media'nın direkt formatını döndür
        return res.status(200).json({
          ...media,
          media: videos,
        });
      } else {
        return res.status(404).json({ error: "Bu tweet'te video bulunamadı (sadece resim var)" });
      }
    }

    // Eğer media array ise direkt döndür (bazı versiyonlarda farklı format olabilir)
    if (Array.isArray(media)) {
      return res.status(200).json({ media });
    }

    // Varsayılan olarak tüm media objesini döndür
    res.status(200).json(media);
  } catch (error) {
    console.error('Error fetching Twitter media:', error);

    // Daha detaylı hata mesajları
    if (error.message.includes('not found')) {
      return res
        .status(404)
        .json({ error: 'Tweet bulunamadı veya özel hesap' });
    }

    if (error.message.includes('rate limit')) {
      return res
        .status(429)
        .json({ error: 'Çok fazla istek. Lütfen biraz bekleyin.' });
    }

    res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
  }
}
