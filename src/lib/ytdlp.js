import path from 'path';
import fs from 'fs';
import youtubedl from 'youtube-dl-exec';
import ffmpegPath from 'ffmpeg-static';

const commonFlags = {
  noCheckCertificates: true,
  noWarnings: true,
  preferFreeFormats: true,
};

export function getFfmpegPath() {
  return ffmpegPath || undefined;
}

export function getCookiesPath() {
  const candidates = [
    process.env.TWITTER_COOKIES,
    process.env.YTDLP_COOKIES,
    path.join(process.cwd(), 'cookies.txt'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

export async function getVideoInfo(url, extra = {}) {
  const cookies = getCookiesPath();
  return youtubedl(url, {
    dumpSingleJson: true,
    ...commonFlags,
    ...(cookies ? { cookies } : {}),
    ...extra,
  });
}

export function formatDuration(seconds = 0) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function sanitizeFilename(name = 'video') {
  return String(name)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'video';
}

/** Unique playable qualities (merged with audio via ffmpeg on download). */
export function buildYoutubeQualities(info) {
  const heights = new Set();

  for (const format of info.formats || []) {
    if (!format.height) continue;
    if (format.vcodec === 'none') continue;
    heights.add(format.height);
  }

  const sorted = [...heights].sort((a, b) => b - a);
  const preferred = sorted.filter((h) =>
    [2160, 1440, 1080, 720, 480, 360, 240, 144].includes(h)
  );
  const list = (preferred.length ? preferred : sorted).slice(0, 8);

  return list.map((height) => ({
    formatId: String(height),
    quality: `${height}p`,
    height,
    ext: 'mp4',
    hasAudio: true,
    hasVideo: true,
    note: 'Ses + görüntü birleştirilir',
  }));
}

export function buildDownloadFormat(height) {
  const h = Number(height);
  if (Number.isFinite(h) && h > 0) {
    return `bv*[height<=${h}]+ba/b[height<=${h}]/bv*+ba/b`;
  }
  return 'bv*+ba/b';
}
