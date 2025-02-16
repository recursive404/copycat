import React, { useState } from 'react';
import { toast } from 'react-toastify';
import '../styles/settings.css';
import BackgroundManager from './BackgroundManager';
const { ipcRenderer } = window.require('electron');

const Settings = ({ settings, onSettingsChange, workspace, setWorkspace }) => {
  const [workspaceLabel, setWorkspaceLabel] = useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState(null);
  const [editingWorkspaceIndex, setEditingWorkspaceIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('workspaces');

  const handleSelectWorkspace = async () => {
    const result = await ipcRenderer.invoke('select-directory');
    if (result) {
      setSelectedDirectory(result);
      setShowLabelInput(true);
    }
  };

  const handleAddWorkspace = () => {
    if (selectedDirectory && workspaceLabel.trim()) {
      const newWorkspace = {
        ...selectedDirectory,
        label: workspaceLabel.trim()
      };
      
      const updatedWorkspaces = workspace ? 
        (Array.isArray(workspace) ? [...workspace, newWorkspace] : [workspace, newWorkspace]) : 
        [newWorkspace];
      
      setWorkspace(updatedWorkspaces);
      ipcRenderer.send('clear-selected-files');
      
      setWorkspaceLabel('');
      setShowLabelInput(false);
      setSelectedDirectory(null);
    }
  };

  const handleRemoveWorkspace = (index) => {
    const updatedWorkspaces = [...workspace];
    updatedWorkspaces.splice(index, 1);
    setWorkspace(updatedWorkspaces.length > 0 ? updatedWorkspaces : null);
    ipcRenderer.send('clear-selected-files');
  };

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
  };

  const categories = [
    {
      id: 'workspaces',
      label: 'Workspaces'
    },
    {
      id: 'appearance',
      label: 'Appearance'
    },
    {
      id: 'reset',
      label: 'Reset Settings'
    }
  ];

  const renderAppearanceSettings = () => (
    <>
      <div className="settings-section">
        <h2>Background Settings</h2>
        <div className="settings-group">
          <label>
            Background Color
            <input
              type="color"
              value={settings.backgroundColor || '#1E1E1E'}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              title="Choose background color"
            />
          </label>
        </div>
        <div className="settings-group">
          <BackgroundManager
            sets={settings.backgroundSets || []}
            onSetsChange={(newSets) => {
              handleChange('backgroundSets', newSets);
            }}
          />
        </div>

        <div className="settings-group">
          <label>
            Background Scale
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
            Background Blur
            <div className="range-with-value">
              <input
                type="range"
                min="0"
                max="20"
                value={settings.blur || 0}
                onChange={(e) => handleChange('blur', e.target.value)}
              />
              <span>{settings.blur || 0}px</span>
            </div>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h2>Opacity Settings</h2>
        <div className="settings-group">
          <label>
            Preview Window Opacity
            <div className="range-with-value">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.01"
                value={settings.previewOpacity || 1}
                onChange={(e) => handleChange('previewOpacity', e.target.value)}
              />
              <span>{settings.previewOpacity || 1}</span>
            </div>
          </label>
        </div>

        <div className="settings-group">
          <label>
            Prompt Input Opacity
            <div className="range-with-value">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.01"
                value={settings.promptOpacity || 1}
                onChange={(e) => handleChange('promptOpacity', e.target.value)}
              />
              <span>{settings.promptOpacity || 1}</span>
            </div>
          </label>
        </div>
      </div>
    </>
  );

  const renderAnimationSettings = () => (
    <>
      <div className="settings-section">
        <h2>Background Slideshow</h2>
        <div className="settings-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.slideshowEnabled || false}
              onChange={(e) => handleChange('slideshowEnabled', e.target.checked)}
            />
            Enable Background Slideshow
          </label>
        </div>

        <div className="settings-group">
          <label>
            Slideshow Interval (seconds)
            <div className="range-with-value">
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={settings.slideshowInterval || 60}
                onChange={(e) => handleChange('slideshowInterval', Number(e.target.value))}
                disabled={!settings.slideshowEnabled}
              />
              <span>{settings.slideshowInterval || 60}s</span>
            </div>
          </label>
        </div>

        <div className="settings-group">
          <label>
            Slideshow Mode
            <select
              value={settings.slideshowMode || 'sequential'}
              onChange={(e) => handleChange('slideshowMode', e.target.value)}
              disabled={!settings.slideshowEnabled}
            >
              <option value="sequential">Sequential</option>
              <option value="random">Random (with repeats)</option>
              <option value="random-no-repeat">Random (no repeats)</option>
            </select>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h2>Background Animation</h2>
      <div className="settings-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.backgroundScroll || false}
            onChange={(e) => handleChange('backgroundScroll', e.target.checked)}
          />
          Enable Background Scroll
        </label>
      </div>

      <div className="settings-group">
        <label>
          Scroll Direction
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
          Scroll Speed
          <div className="range-with-value">
            <input
              type="range"
              min="1"
              max="10"
              value={settings.scrollSpeed || 5}
              onChange={(e) => handleChange('scrollSpeed', Number(e.target.value))}
              disabled={!settings.backgroundScroll}
            />
            <span>{settings.scrollSpeed || 5}</span>
          </div>
        </label>
      </div>
    </div>
    </>
  );

  const renderWorkspaceSettings = () => (
    <div className="settings-section">
      <h2>Manage Workspaces</h2>
      <div className="workspaces-list">
        {workspace && (Array.isArray(workspace) ? workspace : [workspace]).map((ws, index) => (
          <div key={ws.path} className="settings-workspace-item">
            <div className="settings-workspace-info">
              {editingWorkspaceIndex === index ? (
                <input
                  type="text"
                  value={workspaceLabel}
                  onChange={(e) => setWorkspaceLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const updatedWorkspaces = [...(Array.isArray(workspace) ? workspace : [workspace])];
                      updatedWorkspaces[index] = { ...ws, label: workspaceLabel.trim() };
                      setWorkspace(updatedWorkspaces);
                      setEditingWorkspaceIndex(null);
                      setWorkspaceLabel('');
                    } else if (e.key === 'Escape') {
                      setEditingWorkspaceIndex(null);
                      setWorkspaceLabel('');
                    }
                  }}
                  onBlur={() => {
                    setEditingWorkspaceIndex(null);
                    setWorkspaceLabel('');
                  }}
                  autoFocus
                  className="workspace-label-edit"
                />
              ) : (
                <span 
                  className="workspace-label"
                  onClick={() => {
                    setEditingWorkspaceIndex(index);
                    setWorkspaceLabel(ws.label || '');
                  }}
                  title="Click to edit label"
                >
                  {ws.label}
                </span>
              )}
              <span className="workspace-path" title={ws.path}>{ws.path}</span>
            </div>
            <div className="workspace-actions">
              <button 
                onClick={async () => {
                  const refreshed = await ipcRenderer.invoke('refresh-workspace', ws.path);
                  if (refreshed) {
                    const updatedWorkspaces = [...(Array.isArray(workspace) ? workspace : [workspace])];
                    updatedWorkspaces[index] = { ...refreshed, label: ws.label };
                    setWorkspace(updatedWorkspaces);
                    toast.success('Workspace files refreshed');
                  } else {
                    toast.error('Failed to refresh workspace files');
                  }
                }}
                className="refresh-button"
              >
                Refresh
              </button>
              <button 
                onClick={() => handleRemoveWorkspace(index)}
                className="remove-button"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        
        {showLabelInput ? (
          <div className="workspace-label-input">
            <input
              type="text"
              value={workspaceLabel}
              onChange={(e) => setWorkspaceLabel(e.target.value)}
              placeholder="Enter workspace label..."
            />
            <button 
              onClick={handleAddWorkspace}
              disabled={!workspaceLabel.trim()}
            >
              Add
            </button>
            <button onClick={() => {
              setShowLabelInput(false);
              setWorkspaceLabel('');
              setSelectedDirectory(null);
            }}>
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={handleSelectWorkspace} className="add-workspace-button">
            Add Workspace
          </button>
        )}
      </div>

    </div>
  );

  const renderResetSettings = () => (
    <div className="settings-section">
      <h2>Reset All Settings</h2>
      <div className="settings-group">
        <p className="reset-description">
          This will reset all settings to their default values and clear all selected files. This action cannot be undone.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all settings and clear selected files?')) {
              localStorage.clear();
              localStorage.removeItem('savedPrompt');
              setWorkspace(null);
              window.location.reload();
            }
          }}
          className="reset-button"
        >
          Reset All Settings
        </button>
      </div>
    </div>
  );

  return (
    <div className="settings-container">
      <div className="settings-sidebar">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>
      <div className="settings-content">
        {activeCategory === 'workspaces' && renderWorkspaceSettings()}
        {activeCategory === 'appearance' && (
          <>
            {renderAppearanceSettings()}
            {renderAnimationSettings()}
          </>
        )}
        {activeCategory === 'reset' && renderResetSettings()}
      </div>
    </div>
  );
};

export default Settings;
