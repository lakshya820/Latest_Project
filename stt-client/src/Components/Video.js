//import logo from './logo.svg';
//import './App.css';

import { useState , useEffect } from 'react';
import VideoPlayer from './VideoPlayer';

function Video({onNext}) {

  const [videoId, setVideoId] = useState('cdn')
  const [showNextButton, setShowNextButton] = useState(false);

  useEffect(() => {
    // Call playVideo function when the component mounts
    playVideo(null, videoId);
  }, []); // Empty dependency array ensures this effect runs only once on mount

  function playVideo(e, videoId){
    if (e) e.preventDefault();
    setVideoId(videoId)
    setShowNextButton(true);
  }

  return (
    <div className="App">
      <VideoPlayer videoId={videoId} />
      <br />
      {showNextButton && <button type="button" onClick={onNext}>NEXT</button>}
    </div>
  );
}

export default Video;
