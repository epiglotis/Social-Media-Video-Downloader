import React, { useEffect, useState } from 'react';

const TwitterComponent: React.FC = () => {
  const [twitterUrl, setTwitterUrl] = useState<string>('');

  useEffect(() => {
    const fetchTwitterVideo = async () => {
      try {
        const response = await fetch(
          `/api/twitterVideos?url=${encodeURIComponent(twitterUrl)}`
        );
        const data = await response.json();

        if (data.media && data.media.media.length > 0) {
          window.open(data.media.media[0].url, '_blank');
        }

        console.log(data.media);
        console.log(data.media.media[0].url);
      } catch (error) {
        console.error('Error fetching Twitter media:', error);
      }
    };

    // Attach the event listener once the component is mounted
    document
      .getElementById('twitterButton')
      ?.addEventListener('click', fetchTwitterVideo);

    // Clean up the event listener when the component is unmounted
    return () => {
      document
        .getElementById('twitterButton')
        ?.removeEventListener('click', fetchTwitterVideo);
    };
  }, [twitterUrl]); // Run the effect when twitterUrl changes

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTwitterUrl(event.target.value);
  };

  return (
    <div className='flex flex-col gap-5 w-full items-center'>
      <input
        type='text'
        placeholder='Twitter / X URL'
        className='text-black p-5 bg-slate-400 rounded-lg'
        value={twitterUrl}
        onChange={handleInputChange}
      />
      <button className='bg-slate-500 p-2 rounded-lg' id='twitterButton'>
        Get Twitter / X Video
      </button>
    </div>
  );
};

export default TwitterComponent;
