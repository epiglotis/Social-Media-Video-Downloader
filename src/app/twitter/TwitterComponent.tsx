// components/TwitterComponent.tsx
import React, { useEffect } from 'react';

const TwitterComponent: React.FC = () => {
  useEffect(() => {
    const fetchTwitterVideo = async () => {
      try {
        const response = await fetch('/api/twitterVideos');
        const data = await response.json();
        console.log(data.media);
      } catch (error) {
        console.error('Error fetching Twitter media:', error);
      }
    };

    // Attach the event listener once the component is mounted
    document.getElementById('twitterButton')?.addEventListener('click', fetchTwitterVideo);

    // Clean up the event listener when the component is unmounted
    return () => {
      document.getElementById('twitterButton')?.removeEventListener('click', fetchTwitterVideo);
    };
  }, []); // Run the effect only once on component mount

  return <button id="twitterButton">Fetch Twitter Video</button>;
};

export default TwitterComponent;
