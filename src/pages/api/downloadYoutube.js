import fs from 'fs';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import youtubedl from 'youtube-dl-exec';
import {
  getFfmpegPath,
  getCookiesPath,
  sanitizeFilename,
  buildDownloadFormat,
} from '../../lib/ytdlp';

export const config = {
  api: {
    responseLimit: false,
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  let tempFile;

  try {
    const { url, formatId, height } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parametresi eksik' });
    }

    const qualityHeight = height || formatId;
    const format = buildDownloadFormat(qualityHeight);
    const ffmpegLocation = getFfmpegPath();
    const cookies = getCookiesPath();

    if (!ffmpegLocation) {
      return res.status(500).json({
        error: 'ffmpeg bulunamadı. ffmpeg-static paketinin kurulu olduğundan emin olun.',
      });
    }

    tempFile = path.join(os.tmpdir(), `yt-${randomUUID()}.mp4`);

    console.log('Downloading YouTube video:', url, 'format:', format);

    await youtubedl(url, {
      format,
      mergeOutputFormat: 'mp4',
      output: tempFile,
      ffmpegLocation,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      ...(cookies ? { cookies } : {}),
    });

    if (!fs.existsSync(tempFile)) {
      return res.status(404).json({ error: 'İndirme tamamlanamadı' });
    }

    const mode = req.query.mode || 'file';

    // Client'ın yeni sekmede açması için geçici indirme URL'si yerine
    // doğrudan dosya stream'i (mode=file) veya metadata (mode=json)
    if (mode === 'json') {
      const stats = fs.statSync(tempFile);
      // JSON modunda dosyayı tutmayız — sadece bilgi; dosyayı sil
      fs.unlinkSync(tempFile);
      tempFile = null;
      return res.status(200).json({
        ok: true,
        size: stats.size,
        message: 'Dosya hazır. mode=file ile indirin.',
      });
    }

    // Başlık için hızlı info (zaten indirdik; dosya adını query'den veya generic kullan)
    const filename = `${sanitizeFilename(req.query.title || 'youtube-video')}.mp4`;
    const stats = fs.statSync(tempFile);

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    res.setHeader('Content-Length', stats.size);

    const stream = fs.createReadStream(tempFile);
    stream.on('close', () => {
      fs.promises.unlink(tempFile).catch(() => {});
      tempFile = null;
    });
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      fs.promises.unlink(tempFile).catch(() => {});
      tempFile = null;
      if (!res.headersSent) {
        res.status(500).json({ error: 'Dosya okunamadı' });
      }
    });
    stream.pipe(res);
  } catch (error) {
    console.error('Error downloading YouTube video:', error);
    if (tempFile) {
      fs.promises.unlink(tempFile).catch(() => {});
    }
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Sunucu hatası: ' + (error?.message || String(error)),
      });
    }
  }
}
