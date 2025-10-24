'use client'

import YoutubeComponent from './YoutubeComponent';
import Image from 'next/image';
import YoutubeLogo from "../../../public/youtubeLogo.svg"
import Link from 'next/link';

const Youtube: React.FC = () => {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <Link href="/" className='absolute top-8 left-8 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors'>
        ← Ana Sayfa
      </Link>
      
      <Image src={YoutubeLogo} alt='YouTube Logo' width={100} height={24}/>
      <h1 className='p-5 text-2xl text-center font-bold'>
        YouTube Video İndirici
      </h1>
      <YoutubeComponent />
    </main>
  );
};

export default Youtube;
