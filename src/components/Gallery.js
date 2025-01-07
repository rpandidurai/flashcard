import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize, Minimize, Volume2 } from 'lucide-react';

const Gallery = ({ items = [] }) => {
  // Prevent the component from rendering if there are no items
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p>No items in gallery</p>
      </div>
    );
  }

  const [fullscreen, setFullscreen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
      setFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => {
        console.log('Error attempting to exit fullscreen:', err);
      });
      setFullscreen(false);
    }
  };

  const playAudio = (item) => {
    if (!item) return;
    
    setIsPlaying(true);
    if (item.audioUrl) {
      const audio = new Audio(item.audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        console.log('Error playing audio file');
      };
      audio.play().catch(err => {
        setIsPlaying(false);
        console.log('Error playing audio:', err);
      });
    } else if (item.name) {
      const speech = new SpeechSynthesisUtterance(item.name);
      speech.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(speech);
    }
  };

  const navigate = (direction, e) => {
    e.stopPropagation();
    if (items.length <= 1) return;
    
    const newIndex = direction === 'next' 
      ? (activeIndex + 1) % items.length
      : (activeIndex - 1 + items.length) % items.length;
    setActiveIndex(newIndex);
  };

  const handleKeyPress = (e) => {
    switch(e.key) {
      case 'ArrowLeft':
        navigate('prev', e);
        break;
      case 'ArrowRight':
        navigate('next', e);
        break;
      case 'Escape':
        if (fullscreen) toggleFullscreen(e);
        break;
      case ' ':
        e.preventDefault();
        playAudio(items[activeIndex]);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [activeIndex, fullscreen, items]);

  // Ensure we have a valid activeIndex
  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(0);
    }
  }, [items, activeIndex]);

  const activeItem = items[activeIndex] || items[0];
  if (!activeItem) return null;

  return (
    <div className={`relative ${fullscreen ? 'fixed inset-0 bg-black z-50' : ''}`}>
      {/* Main Image Display */}
      <div 
        className="relative h-96 md:h-[80vh] flex items-center justify-center bg-black"
        onClick={() => playAudio(activeItem)}
      >
        <img
          src={activeItem.imageUrl || "/api/placeholder/400/300"}
          alt={activeItem.name || 'Gallery image'}
          className="max-h-full max-w-full object-contain"
        />
        
        {/* Navigation Controls - Only show if more than one item */}
        {items.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => navigate('prev', e)}
              className="p-2 bg-black/50 text-white rounded-full hover:bg-black/75"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={(e) => navigate('next', e)}
              className="p-2 bg-black/50 text-white rounded-full hover:bg-black/75"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
          <div className="text-white font-medium">
            {activeItem.name || 'Untitled'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); playAudio(activeItem); }}
              className={`p-2 rounded-full ${isPlaying ? 'bg-blue-500' : 'bg-black/50'} text-white`}
              title="Play audio"
            >
              <Volume2 size={20} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-black/50 text-white rounded-full"
              title="Toggle fullscreen"
            >
              {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>

        {/* Bottom Progress Bar - Only show if more than one item */}
        {items.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex gap-1 justify-center">
              {items.map((_, index) => (
                <button
                  key={index}
                  className={`h-1 rounded-full transition-all ${
                    index === activeIndex ? 'w-8 bg-blue-500' : 'w-4 bg-white/50'
                  }`}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setActiveIndex(index); 
                  }}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
