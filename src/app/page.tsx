import Image from 'next/image';
import xLogo from '../../public/twitterXLogo.svg';
import youtubeLogo from '../../public/youtubeLogo.svg';
import tiktokLogo from '../../public/tiktokLogo.svg';
import Link from 'next/link';

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-8'>
      <h1 className='p-5 text-6xl font-bold'>Hoş Geldiniz!</h1>
      <h2 className='p-5 text-2xl text-center max-w-2xl'>
        Video indirmek istediğiniz sosyal medya platformunu seçin
      </h2>
      
      <div className='flex items-center justify-center gap-10 my-8'>
        <button className='hover:scale-110 transition-transform'>
          <Link href='/twitter'>
            <Image src={xLogo} alt='Twitter/X Logo' width={100} height={24} />
          </Link>
        </button>
        <button className='hover:scale-110 transition-transform'>
          <Link href='/youtube'>
            <Image src={youtubeLogo} alt='YouTube Logo' width={100} height={24} />
          </Link>
        </button>
        <button className='hover:scale-110 transition-transform opacity-50 cursor-not-allowed' disabled>
          <Link href='/tiktok'>
            <Image src={tiktokLogo} alt='TikTok Logo' width={100} height={24} />
          </Link>
        </button>
      </div>

      {/* Bilgilendirme Kutusu */}
      <div className='max-w-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mt-8 shadow-lg'>
        <h3 className='text-xl font-bold text-blue-900 mb-4'>📥 Video İndirme Rehberi</h3>
        
        <div className='space-y-4 text-gray-700'>
          <div>
            <h4 className='font-semibold text-blue-800 mb-2'>✅ Desteklenen Platformlar:</h4>
            <ul className='list-disc list-inside ml-4 space-y-1'>
              <li><strong>YouTube:</strong> Aktif (sesli MP4, kalite seçimi)</li>
              <li><strong>Twitter / X:</strong> Aktif (herkese açık videolar; gerekirse cookies.txt)</li>
              <li><strong>TikTok:</strong> Yakında</li>
            </ul>
          </div>

          <div>
            <h4 className='font-semibold text-blue-800 mb-2'>📱 Nasıl İndirilir?</h4>
            <ol className='list-decimal list-inside ml-4 space-y-1'>
              <li>Platform logosuna tıklayın</li>
              <li>Video linkini yapıştırın</li>
              <li>İndir butonuna tıklayın</li>
              <li>Açılan videoya sağ tıklayıp kaydedin (PC) veya uzun basın (Mobil)</li>
            </ol>
          </div>

          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
            <p className='text-sm text-yellow-800'>
              <strong>💡 İpucu:</strong> Video yeni sekmede açılır. Bilgisayarda sağ tıklayıp "Videoyu farklı kaydet", 
              mobilde videoyu uzun basıp "İndir" seçeneğini kullanabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
