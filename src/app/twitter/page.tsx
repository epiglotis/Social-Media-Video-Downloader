'use client'

import dynamic from 'next/dynamic';
import TwitterComponent from './TwitterComponent';

const Twitter: React.FC = () => {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <h1 className='p-5 text-2xl text-center'>
        Twitter / X Video Downloader
      </h1>
      <TwitterComponent />
    </main>
  );
};

export default Twitter;
