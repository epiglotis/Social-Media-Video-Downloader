import React, { useState } from 'react';

type TwitterMedia = {
  url: string;
  thumbnail?: string;
  type?: string;
  quality?: string;
  height?: number;
  width?: number;
};

type TwitterInfo = {
  title?: string;
  author?: string;
  authorHandle?: string;
  source?: string;
  media: TwitterMedia[];
};

const TwitterComponent: React.FC = () => {
  const [twitterUrl, setTwitterUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hint, setHint] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<TwitterInfo | null>(null);

  const fetchTwitterVideo = async () => {
    if (!twitterUrl.trim()) {
      setError("Lütfen bir Twitter URL'si girin");
      return;
    }

    setLoading(true);
    setError('');
    setHint('');
    setVideoInfo(null);

    try {
      const response = await fetch(
        `/api/twitterVideos?url=${encodeURIComponent(twitterUrl)}`
      );
      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || `HTTP error! status: ${response.status}`);
        if (data.hint) setHint(data.hint);
        if (data.title) {
          setVideoInfo({
            title: data.title,
            author: data.author,
            media: [],
          });
        }
        return;
      }

      if (data.media?.length > 0) {
        setVideoInfo({
          title: data.title,
          author: data.author,
          authorHandle: data.authorHandle,
          source: data.source,
          media: data.media,
        });
      } else {
        setError("Bu tweet'te video bulunamadı");
      }
    } catch (err) {
      setError(
        'Video indirilirken bir hata oluştu: ' + (err as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTwitterUrl(event.target.value);
    setError('');
    setHint('');
    setVideoInfo(null);
  };

  const openMedia = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className='flex flex-col gap-5 w-full items-center max-w-md'>
      <input
        type='text'
        placeholder='Twitter / X URL (örn: https://x.com/user/status/123)'
        className='text-black p-4 bg-slate-200 rounded-lg w-full border-2 border-slate-300 focus:border-blue-500 focus:outline-none'
        value={twitterUrl}
        onChange={handleInputChange}
        disabled={loading}
      />

      <button
        onClick={fetchTwitterVideo}
        disabled={loading || !twitterUrl.trim()}
        className={`p-4 rounded-lg w-full font-semibold transition-colors ${
          loading || !twitterUrl.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {loading ? 'Aranıyor...' : 'Twitter / X Video Bul'}
      </button>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg w-full'>
          <strong>Hata:</strong> {error}
          {hint && <p className='mt-2 text-sm'>{hint}</p>}
        </div>
      )}

      {videoInfo && (
        <div className='bg-green-100 border border-green-400 text-green-900 px-4 py-3 rounded-lg w-full'>
          <strong className='text-lg'>
            {videoInfo.media.length > 0 ? 'Video bulundu' : 'Tweet bulundu'}
          </strong>
          {videoInfo.author && (
            <p className='mt-2'>
              <strong>Hesap:</strong> {videoInfo.author}
              {videoInfo.authorHandle ? ` (@${videoInfo.authorHandle})` : ''}
            </p>
          )}
          {videoInfo.title && (
            <p className='mt-1 text-sm line-clamp-3'>{videoInfo.title}</p>
          )}
          {videoInfo.source && (
            <p className='mt-1 text-xs text-green-800'>
              Kaynak: {videoInfo.source}
            </p>
          )}

          {videoInfo.media.length > 0 && (
            <div className='border-t border-green-300 pt-3 mt-3 space-y-2'>
              {videoInfo.media.map((media, index) => (
                <button
                  key={`${media.url}-${index}`}
                  onClick={() => openMedia(media.url)}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg text-left'
                >
                  <div className='flex justify-between items-center'>
                    <div>
                      <div>
                        <strong>
                          {media.quality ||
                            (media.height ? `${media.height}p` : `Video ${index + 1}`)}
                        </strong>
                      </div>
                      <div className='text-xs text-blue-100'>
                        Yeni sekmede aç — sağ tık / uzun basarak kaydedin
                      </div>
                    </div>
                    <span>Aç</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className='flex items-center gap-2 text-blue-600'>
          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
          Video işleniyor...
        </div>
      )}

      <div className='bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg w-full text-sm mt-2'>
        <p className='font-semibold mb-2'>Nasıl kullanılır?</p>
        <ol className='list-decimal list-inside space-y-1 ml-2'>
          <li>Herkese açık bir tweet videosunun linkini yapıştırın</li>
          <li>Bulunan videoyu yeni sekmede açıp kaydedin</li>
        </ol>
        <p className='text-xs mt-2 border-t border-blue-200 pt-2'>
          X bazen misafir erişimde video URL&apos;lerini gizler. Gerekirse
          tarayıcı çerezlerini Netscape formatında <code>cookies.txt</code>{' '}
          olarak proje köküne koyun.
        </p>
      </div>
    </div>
  );
};

export default TwitterComponent;
