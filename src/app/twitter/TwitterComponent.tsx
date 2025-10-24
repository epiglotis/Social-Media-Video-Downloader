import React, { useState } from 'react';

const TwitterComponent: React.FC = () => {
  const [twitterUrl, setTwitterUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const fetchTwitterVideo = async () => {
    if (!twitterUrl.trim()) {
      setError('Lütfen bir Twitter URL\'si girin');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `/api/twitterVideos?url=${encodeURIComponent(twitterUrl)}`
      );
      
      const data = await response.json();
      console.log('API Response:', data);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

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

      // Media verisini kontrol et
      // get-twitter-media paketi şu formatı döndürüyor:
      // { found: true, type: "video", media: [{url: "..."}] }
      console.log('Full data:', data);
      
      if (data.media && Array.isArray(data.media) && data.media.length > 0) {
        // API'den { media: [{url: "..."}] } formatında geliyorsa
        const videoUrl = data.media[0].url;
        console.log('Video URL:', videoUrl);
        
        if (videoUrl) {
          window.open(videoUrl, '_blank');
          setSuccess('Video başarıyla açıldı!');
        } else {
          setError('Video URL\'si bulunamadı');
        }
      } else {
        console.log('Media data structure:', JSON.stringify(data, null, 2));
        setError('Bu tweet\'te video bulunamadı');
      }
    } catch (error) {
      console.error('Error fetching Twitter media:', error);
      setError('Video indirilirken bir hata oluştu: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTwitterUrl(event.target.value);
    setError('');
    setSuccess('');
  };

  return (
    <div className='flex flex-col gap-5 w-full items-center max-w-md'>
      <input
        type='text'
        placeholder='Twitter / X URL (örn: https://twitter.com/user/status/123456)'
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
        {loading ? 'İndiriliyor...' : 'Twitter / X Video İndir'}
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
          <div className='mt-3 text-sm border-t border-green-300 pt-3'>
            <p className='font-semibold mb-2'>📥 Videoyu İndirmek İçin:</p>
            <ul className='list-disc list-inside space-y-1 ml-2'>
              <li><strong>Bilgisayarda:</strong> Video üzerine sağ tıklayın → "Videoyu farklı kaydet" veya "Save video as"</li>
              <li><strong>Mobilde:</strong> Videoyu uzun basın → "İndir" veya "Download" seçeneğini seçin</li>
              <li><strong>Alternatif:</strong> Video oynatıcısının sağ alt köşesindeki ⋮ (üç nokta) menüsünden indirin</li>
            </ul>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className='flex items-center gap-2 text-blue-600'>
          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
          Video işleniyor...
        </div>
      )}

      {/* Kullanım Talimatları */}
      <div className='bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg w-full text-sm mt-2'>
        <p className='font-semibold mb-2'>ℹ️ Nasıl Kullanılır?</p>
        <ol className='list-decimal list-inside space-y-1 ml-2'>
          <li>İndirmek istediğiniz Twitter/X videosunun linkini kopyalayın</li>
          <li>Yukarıdaki kutuya yapıştırın</li>
          <li>"Twitter / X Video İndir" butonuna tıklayın</li>
          <li>Yeni sekmede açılan videoyu yukarıdaki talimatlara göre indirin</li>
        </ol>
      </div>
    </div>
  );
};

export default TwitterComponent;
