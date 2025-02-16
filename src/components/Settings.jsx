import React from 'react';
import { toast } from 'react-toastify';
import '../styles/settings.css';
const { ipcRenderer } = window.require('electron');

const Settings = ({ settings, onSettingsChange, workspace, setWorkspace }) => {
  const handleSelectWorkspace = async () => {
    const result = await ipcRenderer.invoke('select-directory');
    if (result) {
      setWorkspace(result);
      // Clear selected files when workspace changes
      ipcRenderer.send('clear-selected-files');
    }
  };
  const handleChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="settings-content" style={{
      flex: '1 1 auto',
      overflowY: 'auto',
      padding: '0 20px',
      margin: '0 -20px' // Compensate for container padding
    }}>
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
            step="0.01"
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
          Enable Background Scroll:
          <input
            type="checkbox"
            checked={settings.backgroundScroll || false}
            onChange={(e) => handleChange('backgroundScroll', e.target.checked)}
          />
        </label>
      </div>

      <div className="settings-group">
        <label>
          Scroll Direction:
          <select
            value={settings.scrollDirection || 'right'}
            onChange={(e) => handleChange('scrollDirection', e.target.value)}
            disabled={!settings.backgroundScroll}
          >
            <option value="right">Right</option>
            <option value="left">Left</option>
            <option value="up">Up</option>
            <option value="down">Down</option>
            <option value="diagonal-up-right">Diagonal Up Right</option>
            <option value="diagonal-up-left">Diagonal Up Left</option>
            <option value="diagonal-down-right">Diagonal Down Right</option>
            <option value="diagonal-down-left">Diagonal Down Left</option>
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
            value={settings.scrollSpeed || 5}
            onChange={(e) => handleChange('scrollSpeed', Number(e.target.value))}
            disabled={!settings.backgroundScroll}
          />
          {settings.scrollSpeed || 5}
        </label>
      </div>

      <div className="settings-group">
        <label>
          Background Scale:
          <select
            value={settings.backgroundScale || 'cover'}
            onChange={(e) => handleChange('backgroundScale', e.target.value)}
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="100%">100%</option>
            <option value="150%">150%</option>
            <option value="200%">200%</option>
          </select>
        </label>
      </div>

      <div className="settings-group">
        <label>
          Workspace Directory:
          <div className="workspace-control">
            <input
              type="text"
              value={workspace?.path || ''}
              readOnly
              placeholder="No workspace selected"
              style={{ flex: 1 }}
            />
            <button onClick={handleSelectWorkspace}>
              Select Workspace
            </button>
            {workspace && (
              <button 
                onClick={async () => {
                  const refreshed = await ipcRenderer.invoke('refresh-workspace', workspace.path);
                  if (refreshed) {
                    setWorkspace(refreshed);
                    toast.success('Workspace files refreshed');
                  } else {
                    toast.error('Failed to refresh workspace files');
                  }
                }}
                style={{ marginLeft: '8px' }}
              >
                Refresh Files
              </button>
            )}
          </div>
        </label>
      </div>

      <div className="settings-group">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all settings and clear selected files?')) {
              localStorage.clear();
              // Clear the saved prompt specifically
              localStorage.removeItem('savedPrompt');
              setWorkspace(null);
              window.location.reload();
            }
          }}
          className="reset-button"
          style={{ marginTop: '20px', backgroundColor: '#ff4444' }}
        >
          Reset All Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
