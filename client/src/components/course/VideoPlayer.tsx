import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface VideoPlayerProps {
  videoUrl: string;
  courseId: number;
  moduleId: number;
  lastPosition?: number;
  thumbnailUrl?: string;
  onProgress: (position: number) => void;
  onComplete: () => void;
}

const VideoPlayer = ({ 
  videoUrl, 
  courseId,
  moduleId,
  lastPosition = 0,
  thumbnailUrl,
  onProgress,
  onComplete
}: VideoPlayerProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(lastPosition);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTime = useRef<number>(lastPosition);
  
  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Update progress every 5 seconds while playing
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        if (videoRef.current) {
          const currentPosition = videoRef.current.currentTime;
          setCurrentTime(currentPosition);
          
          // Save progress if more than 5 seconds have passed
          if (Math.abs(currentPosition - lastSaveTime.current) > 5) {
            lastSaveTime.current = currentPosition;
            onProgress(currentPosition);
            
            // Save progress to server
            saveProgress(currentPosition);
          }
          
          // Check if video is complete (within 3 seconds of the end)
          if (duration > 0 && duration - currentPosition < 3) {
            onComplete();
            saveProgress(duration, true);
          }
        }
      }, 1000);
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, duration]);
  
  // Load metadata when video loads
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      
      // Set initial position if provided
      if (lastPosition > 0) {
        videoRef.current.currentTime = lastPosition;
        setCurrentTime(lastPosition);
      }
    }
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      setShowControls(false);
    }
  };
  
  // Seek to position
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * duration;
      
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      // Save progress to server after seeking
      saveProgress(newTime);
    }
  };
  
  // Save progress to server
  const saveProgress = async (position: number, completed = false) => {
    try {
      await apiRequest('POST', '/api/progress/update', {
        moduleId,
        courseId,
        lastPosition: position,
        completed,
        timeSpent: (position - lastSaveTime.current) / 60 // Convert to minutes
      });
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: t('error'),
        description: t('errorSavingProgress'),
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="relative bg-black">
      <div className="relative h-0 pb-[56.25%]">
        {/* Actual video element */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full"
          src={videoUrl}
          poster={thumbnailUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            onComplete();
            saveProgress(duration, true);
          }}
          onClick={togglePlay}
          onMouseMove={() => setShowControls(true)}
          onMouseLeave={() => !isPlaying && setShowControls(false)}
        />
        
        {/* Controls overlay */}
        <div 
          className={`absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center transition-opacity duration-300 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={togglePlay}
        >
          {!isPlaying && (
            <button className="bg-white bg-opacity-90 rounded-full p-3">
              <span className="material-icons text-primary text-4xl">play_arrow</span>
            </button>
          )}
        </div>
        
        {/* Video progress bar */}
        <div 
          className={`absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="h-1 bg-white bg-opacity-30 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-1 bg-primary rounded-full" 
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
