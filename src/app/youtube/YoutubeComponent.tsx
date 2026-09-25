import React, { useState } from 'react';

const YoutubeComponent: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<any>(null);

  const fetchYoutubeVideo = async () => {
    if (!youtubeUrl.trim()) {
      setError("Lütfen bir YouTube URL'si girin");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setVideoInfo(null);

    try {
      const response = await fetch(
        `/api/youtubeVideos?url=${encodeURIComponent(youtubeUrl)}`
      );
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (!response.ok) {
        setError(data.error || `HTTP error! status: ${response.status}`);
        return;
      }

      if (data.formats?.length > 0) {
        setVideoInfo(data);
      } else {
        setError('Bu video için indirme linki bulunamadı');
      }
    } catch (err) {
      setError(
        'Video bilgisi alınırken hata oluştu: ' + (err as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(event.target.value);
    setError('');
    setSuccess('');
    setVideoInfo(null);
  };

  const downloadVideo = (formatId: string, quality: string) => {
    setDownloading(formatId);
    setError('');
    setSuccess(`${quality} indiriliyor — tamamlanınca tarayıcı kaydedecek...`);

    const params = new URLSearchParams({
      url: youtubeUrl,
      formatId,
      title: videoInfo?.title || 'youtube-video',
    });

    // Gerçek dosya indirmesi (ses+görüntü birleşik mp4)
    window.location.href = `/api/downloadYoutube?${params.toString()}`;

    setTimeout(() => {
      setDownloading(null);
      setSuccess(`${quality} indirme başlatıldı.`);
    }, 1500);
  };

  return (
    <div className='flex flex-col gap-5 w-full items-center max-w-2xl'>
      <input
        type='text'
        placeholder='YouTube URL (örn: https://www.youtube.com/watch?v=...)'
        className='text-black p-4 bg-slate-200 rounded-lg w-full border-2 border-slate-300 focus:border-red-500 focus:outline-none'
        value={youtubeUrl}
        onChange={handleInputChange}
        disabled={loading}
      />

      <button
        onClick={fetchYoutubeVideo}
        disabled={loading || !youtubeUrl.trim()}
        className={`p-4 rounded-lg w-full font-semibold transition-colors ${
          loading || !youtubeUrl.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        {loading ? 'Yükleniyor...' : 'Video Bilgisini Getir'}
      </button>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg w-full'>
          <strong>Hata:</strong> {error}
        </div>
      )}

      {success && (
        <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg w-full'>
          <strong>Bilgi:</strong> {success}
        </div>
      )}

      {videoInfo && (
        <div className='bg-green-100 border border-green-400 text-green-900 px-4 py-3 rounded-lg w-full'>
          <div className='mb-3'>
            <strong className='text-lg'>Video bulundu</strong>
            <p className='mt-2'>
              <strong>Başlık:</strong> {videoInfo.title}
            </p>
            <p>
              <strong>Süre:</strong> {videoInfo.duration}
            </p>
            {videoInfo.author && (
              <p>
                <strong>Kanal:</strong> {videoInfo.author}
              </p>
            )}
          </div>

          <div className='border-t border-green-300 pt-3 mt-3'>
            <p className='font-semibold mb-2'>İndirme seçenekleri (sesli):</p>
            <div className='space-y-2'>
              {videoInfo.formats.map((format: any) => (
                <button
                  key={format.formatId}
                  onClick={() =>
                    downloadVideo(format.formatId, format.quality)
                  }
                  className='w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors text-left disabled:opacity-60'
                  disabled={!!downloading}
                >
                  <div className='flex justify-between items-center'>
                    <div>
                      <div>
                        <strong>{format.quality}</strong> — MP4
                      </div>
                      <div className='text-xs text-green-100'>
                        {format.note || 'Ses + görüntü'}
                      </div>
                    </div>
                    <span className='text-sm'>
                      {downloading === format.formatId
                        ? 'İndiriliyor...'
                        : 'İndir'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className='flex items-center gap-2 text-red-600'>
          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-red-600'></div>
          Video işleniyor...
        </div>
      )}

      <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg w-full text-sm mt-2'>
        <p className='font-semibold mb-2'>Nasıl kullanılır?</p>
        <ol className='list-decimal list-inside space-y-1 ml-2'>
          <li>YouTube video linkini yapıştırın</li>
          <li>Bilgiyi getirin</li>
          <li>Kalite seçin — sunucu sesi ve görüntüyü birleştirip indirir</li>
        </ol>
      </div>
    </div>
  );
};

export default YoutubeComponent;
