import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface TranscriptSegment {
  startTime: number;
  endTime: number;
  text: string;
}

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onJumpToTime: (time: number) => void;
}

const TranscriptViewer = ({ segments, currentTime, onJumpToTime }: TranscriptViewerProps) => {
  const { t } = useTranslation();
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Find active segment based on current time
  useEffect(() => {
    const index = segments.findIndex(
      segment => currentTime >= segment.startTime && currentTime <= segment.endTime
    );
    
    if (index !== -1 && index !== activeSegmentIndex) {
      setActiveSegmentIndex(index);
      
      // Scroll to active segment
      if (segmentRefs.current[index] && containerRef.current) {
        const segmentEl = segmentRefs.current[index];
        const containerEl = containerRef.current;
        
        containerEl.scrollTo({
          top: segmentEl!.offsetTop - containerEl.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    }
  }, [currentTime, segments]);
  
  // Handle clicking on a segment
  const handleJumpToSegment = (startTime: number) => {
    onJumpToTime(startTime);
  };
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4" 
    >
      {segments.map((segment, index) => (
        <div 
          key={index}
          ref={el => segmentRefs.current[index] = el}
          className={`mb-4 ${
            index === activeSegmentIndex 
              ? 'bg-primary bg-opacity-10 p-3 rounded-md' 
              : ''
          }`}
        >
          <div className="flex justify-between text-xs text-neutral-medium mb-1">
            <span>{Math.floor(segment.startTime / 60)}:{(Math.floor(segment.startTime) % 60).toString().padStart(2, '0')}</span>
            {index === activeSegmentIndex ? (
              <span className="text-primary">{t('current')}</span>
            ) : (
              <span 
                className="cursor-pointer hover:text-primary"
                onClick={() => handleJumpToSegment(segment.startTime)}
              >
                {t('jumpTo')}
              </span>
            )}
          </div>
          <p className="text-sm">{segment.text}</p>
        </div>
      ))}
    </div>
  );
};

export default TranscriptViewer;
