import React from 'react';
const { ipcRenderer } = window.require('electron');

const Settings = ({ settings, onSettingsChange, workspaceRoot, setWorkspaceRoot }) => {
  const handleSelectWorkspace = async () => {
    const result = await ipcRenderer.invoke('select-directory');
    if (result) {
      setWorkspaceRoot(result.path);
    }
  };
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
            value={settings.scrollDirection || 'n'}
            onChange={(e) => handleChange('scrollDirection', e.target.value)}
          >
            <option value="n">North ↑</option>
            <option value="ne">North-East ↗</option>
            <option value="e">East →</option>
            <option value="se">South-East ↘</option>
            <option value="s">South ↓</option>
            <option value="sw">South-West ↙</option>
            <option value="w">West ←</option>
            <option value="nw">North-West ↖</option>
          </select>
        </label>
      </div>

      <div className="settings-group">
        <label>
          Scroll Speed:
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={settings.scrollSpeed || 1}
            onChange={(e) => handleChange('scrollSpeed', parseFloat(e.target.value))}
          />
          {settings.scrollSpeed || 1}x
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
              value={workspaceRoot}
              readOnly
              placeholder="No workspace selected"
            />
            <button onClick={handleSelectWorkspace}>
              Select Workspace
            </button>
          </div>
        </label>
      </div>
    </div>
  );
};

export default Settings;
