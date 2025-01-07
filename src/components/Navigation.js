// src/components/Navigation.js
import React from 'react';
import { Home, Grid, Settings } from 'lucide-react';

const Navigation = ({ currentPage, onNavigate }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex justify-around py-2">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'gallery', label: 'Gallery', icon: Grid },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex flex-col items-center p-2 ${
              currentPage === id ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Icon size={24} />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  </nav>
);

export default Navigation;
