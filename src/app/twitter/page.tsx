'use client'

import dynamic from 'next/dynamic';
import TwitterComponent from './TwitterComponent';
import Image from 'next/image';
import TwitterLogo from "../../../public/twitterXLogo.svg"
import Link from 'next/link';

const Twitter: React.FC = () => {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <Link href="/" className='absolute top-8 left-8 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors'>
        ← Ana Sayfa
      </Link>
      
      <Image src={TwitterLogo} alt='TwitterLogo' width={100} height={24}/>
      <h1 className='p-5 text-2xl text-center font-bold'>
        Twitter / X Video İndirici
      </h1>
      <TwitterComponent />
    </main>
  );
};

export default Twitter;
