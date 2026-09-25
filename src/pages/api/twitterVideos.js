import { getVideoInfo, formatDuration } from '../../lib/ytdlp';

function extractTweetId(url) {
  const match = String(url).match(/status\/(\d+)/i);
  return match?.[1] || null;
}

function normalizeTwitterUrl(url) {
  try {
    const urlObj = new URL(url);
    if (
      urlObj.hostname === 'x.com' ||
      urlObj.hostname === 'www.x.com' ||
      urlObj.hostname === 'twitter.com' ||
      urlObj.hostname === 'www.twitter.com' ||
      urlObj.hostname === 'mobile.twitter.com'
    ) {
      const id = extractTweetId(url);
      if (id) return `https://x.com/i/status/${id}`;
    }
    return urlObj.toString();
  } catch {
    return url;
  }
}

function syndicationToken(id) {
  return ((Number(id) / 1e15) * Math.PI)
    .toString(36)
    .replace(/(0+|\.)/g, '');
}

function pickBestVariant(variants = []) {
  const mp4s = variants.filter(
    (v) =>
      (v.content_type || v.contentType || '').includes('mp4') ||
      String(v.url || v.src || '').includes('.mp4')
  );
  if (mp4s.length === 0) return null;
  return mp4s.sort(
    (a, b) => (b.bitrate || 0) - (a.bitrate || 0)
  )[0];
}

function mediaFromSyndication(data) {
  const items = [];

  if (Array.isArray(data.mediaDetails)) {
    for (const media of data.mediaDetails) {
      if (media.type === 'video' || media.type === 'animated_gif') {
        const best = pickBestVariant(media.video_info?.variants || []);
        if (best?.url) {
          items.push({
            url: best.url,
            thumbnail: media.media_url_https || media.media_url,
            type: media.type,
            width: media.original_info?.width || media.sizes?.large?.w,
            height: media.original_info?.height || media.sizes?.large?.h,
            bitrate: best.bitrate,
          });
        }
      }
    }
  }

  if (data.video?.variants) {
    const best = pickBestVariant(data.video.variants);
    const src = best?.src || best?.url;
    if (src) {
      items.push({
        url: src,
        thumbnail: data.video.poster || data.photos?.[0]?.url,
        type: 'video',
        bitrate: best.bitrate,
      });
    }
  }

  return items;
}

function mediaFromFxEmbed(payload) {
  const tweet = payload?.tweet || payload;
  const media = tweet?.media;
  if (!media) return [];

  const videos = media.videos || media.video || [];
  const list = Array.isArray(videos) ? videos : [videos];

  return list
    .filter((v) => v?.url)
    .map((v) => ({
      url: v.url,
      thumbnail: v.thumbnail_url || v.thumbnail,
      type: v.type || 'video',
      width: v.width,
      height: v.height,
      duration: v.duration,
    }));
}

function mediaFromYtDlp(info) {
  const formats = (info.formats || [])
    .filter((f) => f.url && f.vcodec !== 'none')
    .sort((a, b) => (b.height || 0) - (a.height || 0) || (b.tbr || 0) - (a.tbr || 0));

  const seen = new Set();
  const items = [];

  for (const format of formats) {
    if (seen.has(format.url)) continue;
    seen.add(format.url);
    items.push({
      url: format.url,
      thumbnail: info.thumbnail,
      type: 'video',
      width: format.width,
      height: format.height,
      quality: format.height ? `${format.height}p` : format.format_note,
      ext: format.ext,
    });
    if (items.length >= 5) break;
  }

  // Fallback: requested/direct URL
  if (items.length === 0 && info.url) {
    items.push({
      url: info.url,
      thumbnail: info.thumbnail,
      type: 'video',
    });
  }

  return items;
}

async function fetchSyndication(tweetId) {
  const token = syndicationToken(tweetId);
  const url = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&lang=en&token=${token}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok) return null;
  const data = await response.json();
  if (!data || !data.id_str) return null;

  return {
    source: 'syndication',
    title: data.text || `Tweet ${tweetId}`,
    author: data.user?.name || data.user?.screen_name || 'Bilinmiyor',
    authorHandle: data.user?.screen_name,
    thumbnail: data.photos?.[0]?.url || data.video?.poster,
    media: mediaFromSyndication(data),
  };
}

async function fetchFxEmbed(tweetId) {
  const url = `https://api.fxtwitter.com/status/${tweetId}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'SocialMediaVideoDownloader/1.0' },
  });

  if (!response.ok) return null;
  const data = await response.json();
  if (data.code && data.code !== 200) return null;

  const tweet = data.tweet || data;
  return {
    source: 'fxtwitter',
    title: tweet.text || `Tweet ${tweetId}`,
    author: tweet.author?.name || tweet.author?.screen_name || 'Bilinmiyor',
    authorHandle: tweet.author?.screen_name,
    thumbnail:
      tweet.media?.videos?.[0]?.thumbnail_url ||
      tweet.media?.photos?.[0]?.url,
    media: mediaFromFxEmbed(data),
  };
}

async function fetchViaYtDlp(url) {
  const info = await getVideoInfo(url, {
    // Prefer https progressive when available
    format: 'best[ext=mp4]/best',
  });

  return {
    source: 'yt-dlp',
    title: info.title || info.fulltitle || 'Twitter Video',
    author: info.uploader || info.creator || 'Bilinmiyor',
    authorHandle: info.uploader_id,
    duration: formatDuration(info.duration || 0),
    thumbnail: info.thumbnail,
    media: mediaFromYtDlp(info),
  };
}

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parametresi eksik' });
    }

    const tweetId = extractTweetId(url);
    if (!tweetId) {
      return res.status(400).json({
        error: 'Geçerli bir Twitter/X status URL\'si girin',
      });
    }

    const normalizedUrl = normalizeTwitterUrl(url);
    console.log('Twitter lookup:', url, '->', normalizedUrl);

    const errors = [];
    let result = null;

    // 1) FxEmbed
    try {
      result = await fetchFxEmbed(tweetId);
      if (result?.media?.length) {
        return res.status(200).json({
          found: true,
          ...result,
          tweetId,
          url: normalizedUrl,
          media: result.media,
        });
      }
      if (result && !result.media?.length) {
        errors.push('fxtwitter: tweet bulundu ama video yok');
      }
    } catch (e) {
      errors.push('fxtwitter: ' + e.message);
    }

    // 2) Syndication
    try {
      const syndication = await fetchSyndication(tweetId);
      if (syndication?.media?.length) {
        return res.status(200).json({
          found: true,
          ...syndication,
          tweetId,
          url: normalizedUrl,
          media: syndication.media,
        });
      }
      if (syndication) {
        result = result || syndication;
        errors.push('syndication: tweet bulundu ama video metadata yok');
      }
    } catch (e) {
      errors.push('syndication: ' + e.message);
    }

    // 3) yt-dlp (cookies.txt varsa daha yüksek şans)
    try {
      const ytdlp = await fetchViaYtDlp(normalizedUrl);
      if (ytdlp?.media?.length) {
        return res.status(200).json({
          found: true,
          ...ytdlp,
          tweetId,
          url: normalizedUrl,
          media: ytdlp.media,
        });
      }
      errors.push('yt-dlp: video formatı bulunamadı');
    } catch (e) {
      errors.push('yt-dlp: ' + e.message);
    }

    if (result) {
      return res.status(404).json({
        error:
          "Tweet bulundu ancak X (Twitter) misafir erişimde video linkini vermiyor. cookies.txt ile oturum çerezleri ekleyerek tekrar deneyin.",
        tweetId,
        title: result.title,
        author: result.author,
        details: errors,
        hint: 'Tarayıcıdan cookies.txt dışa aktarıp proje köküne koyabilirsiniz (Netscape format).',
      });
    }

    return res.status(404).json({
      error: "Bu tweet'te medya bulunamadı veya tweet erişilebilir değil",
      details: errors,
    });
  } catch (error) {
    console.error('Error fetching Twitter media:', error);
    const message = error?.message || String(error);

    if (/not found|404/i.test(message)) {
      return res.status(404).json({ error: 'Tweet bulunamadı veya özel hesap' });
    }
    if (/rate limit/i.test(message)) {
      return res.status(429).json({ error: 'Çok fazla istek. Lütfen biraz bekleyin.' });
    }

    return res.status(500).json({ error: 'Sunucu hatası: ' + message });
  }
}
