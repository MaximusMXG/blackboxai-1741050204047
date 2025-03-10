import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { videoService } from '../../services/api';
import './CustomVideoPlayer.css';

const CustomVideoPlayer = ({ video, onProgressUpdate }) => {
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const { user, addToWatchHistory } = useAuth();
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('720p');
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [watchSessionId, setWatchSessionId] = useState(null);
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);
  
  // Format time to MM:SS format
  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Initialize player when video changes
  useEffect(() => {
    if (video && videoRef.current) {
      const initializePlayer = async () => {
        // Reset player state
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
        
        // Start a new watch session for analytics
        if (user) {
          try {
            const response = await videoService.addView(video._id);
            setWatchSessionId(response.data.sessionId);
            
            // Add to watch history
            addToWatchHistory(video._id);
          } catch (err) {
            console.error('Error recording video view:', err);
          }
        }
      };
      
      initializePlayer();
    }
  }, [video, user, addToWatchHistory]);
  
  // Handle video metadata loaded
  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      
      // If user has watched this video before, restore progress
      if (video.watchProgress && video.watchProgress > 0) {
        const savedProgress = video.watchProgress * videoRef.current.duration;
        videoRef.current.currentTime = savedProgress;
        setCurrentTime(savedProgress);
        setProgress(video.watchProgress);
      }
    }
  };
  
  // Play/Pause video
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    const videoContainer = videoRef.current.closest('.video-player-container');
    
    if (!document.fullscreenElement) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
      } else if (videoContainer.msRequestFullscreen) {
        videoContainer.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };
  
  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime;
      const newProgress = newTime / videoRef.current.duration;
      
      setCurrentTime(newTime);
      setProgress(newProgress);
      
      // Send progress update every 10 seconds
      if (user && watchSessionId && (newTime - lastProgressUpdate >= 10)) {
        setLastProgressUpdate(newTime);
        
        const progressData = {
          sessionId: watchSessionId,
          progress: newProgress,
          currentTime: newTime,
          completed: newProgress >= 0.95
        };
        
        // Update progress in backend
        try {
          videoService.updateProgress(video._id, progressData);
          
          // Call the progress update callback if provided
          if (onProgressUpdate) {
            onProgressUpdate(progressData);
          }
        } catch (err) {
          console.error('Error updating video progress:', err);
        }
      }
    }
  };
  
  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (videoRef.current && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      
      videoRef.current.currentTime = pos * videoRef.current.duration;
      setProgress(pos);
    }
  };
  
  // Handle volume bar click
  const handleVolumeClick = (e) => {
    if (volumeBarRef.current) {
      const rect = volumeBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newVolume = Math.max(0, Math.min(1, pos));
      
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      
      if (newVolume === 0) {
        setIsMuted(true);
      } else {
        setIsMuted(false);
      }
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };
  
  // Change playback rate
  const changePlaybackRate = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };
  
  // Change video quality
  const changeQuality = (newQuality) => {
    if (video.video_qualities && video.video_qualities[newQuality]) {
      const currentTime = videoRef.current.currentTime;
      setQuality(newQuality);
      
      // Update video source
      videoRef.current.src = video.video_qualities[newQuality] || video.video_url;
      
      // Restore playback state
      videoRef.current.currentTime = currentTime;
      if (isPlaying) {
        videoRef.current.play();
      }
    }
  };
  
  // Hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    
    setControlsTimeout(timeout);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);
  
  return (
    <div 
      className="video-player-container" 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={video.video_qualities && video.video_qualities[quality] ? video.video_qualities[quality] : video.video_url}
        poster={video.thumbnail_url}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleMetadataLoaded}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className={`video-controls ${showControls ? 'visible' : ''}`}>
        <div 
          className="progress-bar" 
          ref={progressBarRef}
          onClick={handleProgressClick}
        >
          <div className="progress-filled" style={{ width: `${progress * 100}%` }}></div>
        </div>
        
        <div className="controls-main">
          <button className="control-btn play-pause" onClick={togglePlay}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
              </svg>
            )}
          </button>
          
          <div className="volume-control">
            <button className="control-btn volume" onClick={toggleMute}>
              {isMuted ? (
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
                </svg>
              )}
            </button>
            
            <div 
              className="volume-bar" 
              ref={volumeBarRef}
              onClick={handleVolumeClick}
            >
              <div className="volume-filled" style={{ width: `${isMuted ? 0 : volume * 100}%` }}></div>
            </div>
          </div>
          
          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <div className="playback-speed">
            <button className="control-btn speed" onClick={() => {
              const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
              const currentIndex = rates.indexOf(playbackRate);
              const nextIndex = (currentIndex + 1) % rates.length;
              changePlaybackRate(rates[nextIndex]);
            }}>
              {playbackRate}x
            </button>
          </div>
          
          <div className="quality-selector">
            <button className="control-btn quality">
              {quality}
              <div className="quality-options">
                {video.video_qualities && Object.keys(video.video_qualities)
                  .filter(q => video.video_qualities[q])
                  .map(q => (
                    <div 
                      key={q} 
                      className={`quality-option ${q === quality ? 'active' : ''}`}
                      onClick={() => changeQuality(q)}
                    >
                      {q}
                    </div>
                  ))
                }
              </div>
            </button>
          </div>
          
          <button className="control-btn fullscreen" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M14,14H19V16H16V19H14V14M5,14H10V19H8V16H5V14M8,5H10V10H5V8H8V5M19,8V10H14V5H16V8H19Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;