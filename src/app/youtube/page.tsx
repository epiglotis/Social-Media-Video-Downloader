'use client'

// import dynamic from 'next/dynamic';
// import TwitterComponent from './TwitterComponent';
import Image from 'next/image';
import YoutubeLogo from "../../../public/youtubeLogo.svg"

const Twitter: React.FC = () => {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <Image src={YoutubeLogo} alt='TwitterLogo' width={100} height={24}/>
      <h1 className='p-5 text-2xl text-center'>
        Youtube Video Downloader
      </h1>
      {/* <TwitterComponent /> */}
    </main>
  );
};

export default Twitter;
