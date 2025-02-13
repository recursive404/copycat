import React from 'react';

const Settings = ({ settings, onSettingsChange }) => {
  const handleChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="settings-panel">
      <h3>Settings</h3>
      <div className="settings-group">
        <label>
          Background Image URL:
          <input
            type="text"
            value={settings.backgroundImage || ''}
            onChange={(e) => handleChange('backgroundImage', e.target.value)}
            placeholder="Enter image URL..."
          />
        </label>
      </div>
      
      <div className="settings-group">
        <label>
          App Opacity:
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={settings.opacity || 1}
            onChange={(e) => handleChange('opacity', e.target.value)}
          />
          {settings.opacity || 1}
        </label>
      </div>

      <div className="settings-group">
        <label>
          Background Blur:
          <input
            type="range"
            min="0"
            max="20"
            value={settings.blur || 0}
            onChange={(e) => handleChange('blur', e.target.value)}
          />
          {settings.blur || 0}px
        </label>
      </div>

      <div className="settings-group">
        <label>
          Scroll Direction:
          <select
            value={settings.scrollDirection || 'vertical'}
            onChange={(e) => handleChange('scrollDirection', e.target.value)}
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </label>
      </div>

      <div className="settings-group">
        <label>
          Scroll Speed:
          <input
            type="range"
            min="1"
            max="10"
            value={settings.scrollSpeed || 1}
            onChange={(e) => handleChange('scrollSpeed', e.target.value)}
          />
          {settings.scrollSpeed || 1}x
        </label>
      </div>
    </div>
  );
};

export default Settings;
