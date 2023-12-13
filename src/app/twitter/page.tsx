'use client'

import dynamic from 'next/dynamic';
import TwitterComponent from './TwitterComponent';

const Twitter: React.FC = () => {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <input></input>
      <TwitterComponent />
    </main>
  );
};

export default Twitter;
