// src/App.js
import React, { useState, useEffect } from 'react';
import AudioRecorder from './components/AudioRecorder';
import Gallery from './components/Gallery';
import ImageUploader from './components/ImageUploader';
import Navigation from './components/Navigation';

const ImageVoiceApp = () => {
  const [items, setItems] = useState([]);
  const [newName, setNewName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    const savedItems = localStorage.getItem('voiceItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      const result = await installPrompt.prompt();
      if (result.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    }
  };

  const handleAddItem = async () => {
    if (newName && (selectedImage || selectedAudio)) {
      try {
        const newItem = {
          id: Date.now(),
          name: newName,
          imageUrl: selectedImage ? URL.createObjectURL(selectedImage) : null,
          audioUrl: selectedAudio ? URL.createObjectURL(selectedAudio) : null,
          timestamp: new Date().toISOString(),
        };

        const updatedItems = [...items, newItem];
        setItems(updatedItems);
        localStorage.setItem('voiceItems', JSON.stringify(updatedItems));

        setNewName('');
        setSelectedImage(null);
        setSelectedAudio(null);
      } catch (error) {
        console.error('Error saving item:', error);
        alert('Failed to save item. Please try again.');
      }
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="space-y-6 pb-20">
            {!isOnline && (
              <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
                You're currently offline. Changes will be saved locally.
              </div>
            )}

            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full p-3 bg-blue-500 text-white rounded flex items-center justify-center gap-2"
              >
                Install App
              </button>
            )}

            <div className="space-y-4 p-4 bg-white rounded-lg shadow">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-3 border rounded"
                placeholder="Enter name"
              />

              <ImageUploader
                onImageSelect={setSelectedImage}
                selectedImage={selectedImage}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium">Audio</label>
                <AudioRecorder
                  onRecordingComplete={setSelectedAudio}
                  selectedAudio={selectedAudio}
                />
              </div>

              <button
                onClick={handleAddItem}
                disabled={!newName || (!selectedImage && !selectedAudio)}
                className="w-full p-3 bg-blue-500 text-white rounded flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Add Item
              </button>
            </div>
          </div>
        );
      case 'gallery':
        return <Gallery items={items} />;
      case 'settings':
        return (
          <div className="space-y-4 p-4 pb-20">
            <h2 className="text-xl font-bold">Settings</h2>
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span>Storage Used</span>
                <span className="text-gray-500">
                  {(JSON.stringify(items).length / 1024).toFixed(2)} KB
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all items?')) {
                    setItems([]);
                    localStorage.removeItem('voiceItems');
                  }
                }}
                className="w-full p-3 bg-red-500 text-white rounded"
              >
                Clear All Data
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold">Image Voice Navigator</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">{renderPage()}</main>

      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
    </div>
  );
};

export default ImageVoiceApp;
