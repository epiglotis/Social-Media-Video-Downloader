import Image from 'next/image';
import xLogo from '../../public/twitterXLogo.svg';
import youtubeLogo from '../../public/youtubeLogo.svg';
import tiktokLogo from '../../public/tiktokLogo.svg';
import Link from 'next/link';

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center'>
      <h1 className='p-5 text-6xl'>Welcome!</h1>
      <h1 className='p-5 text-2xl text-center'>
        Please choose a social media platform from which to download the media.
      </h1>
      <div className='flex items-center justify-center gap-10'>
        <button>
          <Link href='/twitter'>
            <Image src={xLogo} alt='Logo' width={100} height={24} />
          </Link>
        </button>
        <button>
          <Link href='/youtube'>
            <Image src={youtubeLogo} alt='Logo' width={100} height={24} />
          </Link>
        </button>
        <button>
          <Link href='/tiktok'>
            <Image src={tiktokLogo} alt='Logo' width={100} height={24} />
          </Link>
        </button>
      </div>
    </main>
  );
}
