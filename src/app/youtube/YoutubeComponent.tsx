import React, { useState } from 'react';

const YoutubeComponent: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<any>(null);

  const fetchYoutubeVideo = async () => {
    if (!youtubeUrl.trim()) {
      setError('Lütfen bir YouTube URL\'si girin');
      return;
    }

    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await fetch(
        `/api/youtubeVideos?url=${encodeURIComponent(youtubeUrl)}`
      );
      
      const data = await response.json();
      console.log('API Response:', data);

      // API'den error mesajı geldiyse
      if (data.error) {
        setError(data.error);
        return;
      }

      // Response başarısız ise
      if (!response.ok) {
        setError(data.error || `HTTP error! status: ${response.status}`);
        return;
      }

      // Video bilgilerini kaydet
      if (data.formats && data.formats.length > 0) {
        setVideoInfo(data);
      } else if (data.message) {
        // Format bulunamadı ama video bilgisi var
        setVideoInfo(data);
      } else {
        setError('Bu video için indirme linki bulunamadı');
      }
    } catch (error) {
      console.error('Error fetching YouTube video:', error);
      setError('Video indirilirken bir hata oluştu: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(event.target.value);
    setError('');
    setVideoInfo(null);
  };

  const downloadVideo = async (formatId: string, quality: string) => {
    try {
      setLoading(true);
      setError('');
      
      // API'den indirme linkini al
      const response = await fetch(`/api/downloadYoutube?url=${encodeURIComponent(youtubeUrl)}&formatId=${formatId}`);
      const data = await response.json();
      
      if (data.downloadUrl) {
        // İndirme linkini yeni sekmede aç
        window.open(data.downloadUrl, '_blank');
        setSuccess(`${quality} kalitesinde video indiriliyor!`);
      } else {
        setError('İndirme linki alınamadı');
      }
    } catch (error) {
      console.error('Download error:', error);
      setError('İndirme işlemi başlatılamadı');
    } finally {
      setLoading(false);
    }
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
        {loading ? 'Yükleniyor...' : 'YouTube Video İndir'}
      </button>

      {/* Hata mesajı */}
      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg w-full'>
          <strong>Hata:</strong> {error}
        </div>
      )}

      {/* Başarı mesajı */}
      {success && (
        <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg w-full'>
          <strong>Başarılı:</strong> {success}
        </div>
      )}

      {/* Video bilgileri ve indirme seçenekleri */}
      {videoInfo && (
        <div className='bg-green-100 border border-green-400 text-green-900 px-4 py-3 rounded-lg w-full'>
          <div className='mb-3'>
            <strong className='text-lg'>✅ Video Bulundu!</strong>
            <p className='mt-2'><strong>Başlık:</strong> {videoInfo.title}</p>
            <p><strong>Süre:</strong> {videoInfo.duration}</p>
            {videoInfo.author && <p><strong>Kanal:</strong> {videoInfo.author}</p>}
          </div>

          {videoInfo.formats && videoInfo.formats.length > 0 ? (
            <>
              <div className='border-t border-green-300 pt-3 mt-3'>
                <p className='font-semibold mb-2'>📥 İndirme Seçenekleri:</p>
                <div className='space-y-2'>
                  {videoInfo.formats.map((format: any, index: number) => {
                    const fileSize = format.filesize 
                      ? `${(format.filesize / (1024 * 1024)).toFixed(1)} MB`
                      : 'Boyut bilinmiyor';
                    
                    return (
                      <button
                        key={index}
                        onClick={() => downloadVideo(format.formatId, format.quality)}
                        className='w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors text-left'
                        disabled={loading}
                      >
                        <div className='flex justify-between items-center'>
                          <div>
                            <div><strong>{format.quality}</strong> - {format.ext.toUpperCase()}</div>
                            <div className='text-xs text-green-100'>{fileSize}</div>
                          </div>
                          <span className='text-sm'>
                            {format.hasAudio ? '🔊 Ses Var' : '🔇 Ses Yok'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className='mt-3 text-sm border-t border-green-300 pt-3'>
                <p className='font-semibold mb-2'>💡 İndirme Nasıl Çalışır?</p>
                <ul className='list-disc list-inside space-y-1 ml-2'>
                  <li>Yukarıdan istediğiniz kaliteyi seçin</li>
                  <li>Video otomatik olarak indirilmeye başlar</li>
                  <li>İndirme işlemi tarayıcınızın indirme klasörüne kaydedilir</li>
                </ul>
              </div>
            </>
          ) : (
            <div className='border-t border-blue-300 pt-3 mt-3 bg-blue-50 p-3 rounded'>
              <p className='font-semibold mb-2 text-blue-900'>
                ℹ️ {videoInfo.message || 'Video bilgisi bulundu'}
              </p>
              <p className='text-sm mb-3 text-gray-700'>
                YouTube videoları doğrudan indirilemez. Aşağıdaki güvenilir araçları kullanabilirsiniz:
              </p>
              
              {/* İndirme Araçları */}
              {videoInfo.downloadTools && videoInfo.downloadTools.length > 0 && (
                <div className='space-y-2 mb-3'>
                  {videoInfo.downloadTools.map((tool: any, index: number) => (
                    <a
                      key={index}
                      href={tool.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-3 rounded-lg transition-all block'
                    >
                      <div className='flex justify-between items-center'>
                        <div>
                          <p className='font-semibold'>🔗 {tool.name}</p>
                          <p className='text-xs text-blue-100'>{tool.description}</p>
                        </div>
                        <span className='text-xl'>→</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {/* YouTube'da Aç Butonu */}
              <a
                href={videoInfo.youtubeUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors block text-center font-semibold mt-3'
              >
                📺 YouTube'da İzle
              </a>
              
              <p className='text-xs mt-3 text-gray-600 border-t border-blue-200 pt-2'>
                💡 <strong>Not:</strong> Yukarıdaki siteler üçüncü parti servislerdir. Güvenlik için antivirüs kullanmanız önerilir.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className='flex items-center gap-2 text-red-600'>
          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-red-600'></div>
          Video işleniyor...
        </div>
      )}

      {/* Kullanım Talimatları */}
      <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg w-full text-sm mt-2'>
        <p className='font-semibold mb-2'>ℹ️ Nasıl Kullanılır?</p>
        <ol className='list-decimal list-inside space-y-1 ml-2'>
          <li>İndirmek istediğiniz YouTube videosunun linkini kopyalayın</li>
          <li>Yukarıdaki kutuya yapıştırın</li>
          <li>"YouTube Video İndir" butonuna tıklayın</li>
          <li>İstediğiniz kaliteyi seçin (720p, 1080p, vb.)</li>
          <li>Video otomatik olarak indirilmeye başlar</li>
        </ol>
        <p className='text-xs mt-2 border-t border-red-300 pt-2'>
          <strong>⚠️ Önemli:</strong> YouTube'un telif politikaları nedeniyle, sadece izin verilen videoları indirin.
        </p>
      </div>
    </div>
  );
};

export default YoutubeComponent;

