import React, { useState, useEffect } from 'react';
import FileExplorer from './components/FileExplorer';
import PreviewWindow from './components/PreviewWindow';
import PromptInput from './components/PromptInput';
import Settings from './components/Settings';
import './styles/main.css';

function App() {
  // Load selected files from localStorage or use empty array
  const [selectedFiles, setSelectedFiles] = useState(() => {
    const savedFiles = localStorage.getItem('selectedFiles');
    return savedFiles ? JSON.parse(savedFiles) : [];
  });

  // Save selected files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('selectedFiles', JSON.stringify(selectedFiles));
  }, [selectedFiles]);
  const [previewContent, setPreviewContent] = useState('');
  const [prompt, setPrompt] = useState('');
  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('appSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      backgroundImage: '',
      opacity: 1,
      blur: 0,
      scrollDirection: 'n',
      scrollSpeed: 1,
      backgroundScale: 'cover'
    };
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  // Update preview content when files change
  useEffect(() => {
    const content = selectedFiles
      .map(file => `// ${file.name}\n${file.content}`)
      .join('\n\n');
    setPreviewContent(content);
  }, [selectedFiles]);

  // Apply settings to the app
  useEffect(() => {
    document.documentElement.style.setProperty('--blur', `${settings.blur}px`);
    document.documentElement.style.setProperty('--opacity', settings.opacity);

    if (settings.backgroundImage) {
      document.body.style.setProperty(
        'background-image',
        `url(${settings.backgroundImage})`
      );
      document.body.style.setProperty(
        'background-size',
        settings.backgroundScale || 'cover'
      );
    } else {
      document.body.style.removeProperty('background-image');
      document.body.style.removeProperty('background-size');
    }

    // Apply scroll animation to background
    const scrollSpeed = parseFloat(settings.scrollSpeed) || 0;
    const direction = settings.scrollDirection || 'n';

    // Calculate animation properties based on direction and speed
    let keyframes = '';
    const duration = 20 / (scrollSpeed || 1); // Base duration inversely proportional to speed

    switch(direction) {
      case 'n':
        keyframes = '@keyframes bgScroll { 0% { background-position: 50% 100%; } 100% { background-position: 50% 0%; } }';
        break;
      case 's':
        keyframes = '@keyframes bgScroll { 0% { background-position: 50% 0%; } 100% { background-position: 50% 100%; } }';
        break;
      case 'e':
        keyframes = '@keyframes bgScroll { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }';
        break;
      case 'w':
        keyframes = '@keyframes bgScroll { 0% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }';
        break;
      case 'ne':
        keyframes = '@keyframes bgScroll { 0% { background-position: 0% 100%; } 100% { background-position: 100% 0%; } }';
        break;
      case 'nw':
        keyframes = '@keyframes bgScroll { 0% { background-position: 100% 100%; } 100% { background-position: 0% 0%; } }';
        break;
      case 'se':
        keyframes = '@keyframes bgScroll { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }';
        break;
      case 'sw':
        keyframes = '@keyframes bgScroll { 0% { background-position: 100% 0%; } 100% { background-position: 0% 100%; } }';
        break;
      default:
        keyframes = '';
    }

    // Remove existing animation style element
    const existingStyle = document.getElementById('bg-animation');
    if (existingStyle) {
      existingStyle.remove();
    }

    if (scrollSpeed > 0 && keyframes) {
      // Add new animation style
      const style = document.createElement('style');
      style.id = 'bg-animation';
      style.textContent = keyframes;
      document.head.appendChild(style);

      // Apply animation to body::before
      document.body.style.setProperty('animation', `bgScroll ${duration}s linear infinite`);
      document.body.style.setProperty('background-repeat', 'repeat');
    } else {
      document.body.style.setProperty('animation', 'none');
    }
  }, [settings]);

  const [showSettings, setShowSettings] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [workspace, setWorkspace] = useState(() => {
    const savedWorkspace = localStorage.getItem('workspace');
    return savedWorkspace ? JSON.parse(savedWorkspace) : null;
  });

  // Save workspace to localStorage whenever it changes
  useEffect(() => {
    if (workspace) {
      localStorage.setItem('workspace', JSON.stringify(workspace));
    } else {
      localStorage.removeItem('workspace');
    }
  }, [workspace]);

  return (
    <div className="app" style={{ opacity: settings.opacity }}>
      <button
        className="settings-toggle"
        onClick={() => setShowSettings(!showSettings)}
        title="Toggle Settings"
      >
        ⚙️
      </button>
      {showSettings && (
        <Settings
          settings={settings}
          onSettingsChange={setSettings}
          workspace={workspace}
          setWorkspace={setWorkspace}
        />
      )}
      <div className="main-container">
        <div className="full-panel">
          <div className="file-controls">
            <button 
              className="add-files-button"
              onClick={() => setShowFileModal(true)}
            >
              + Add Files
            </button>
          </div>
          <PreviewWindow content={previewContent} />
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={() => {/* TODO */}}
          />
        </div>

        {showFileModal && (
          <div className="file-modal-overlay" onClick={(e) => {
            if (e.target.className === 'file-modal-overlay') {
              setShowFileModal(false);
            }
          }}>
            <div className="file-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Select Files</h3>
                <button 
                  className="close-button"
                  onClick={() => setShowFileModal(false)}
                >
                  &times;
                </button>
              </div>
              <FileExplorer
                onFilesSelected={(files) => {
                  setSelectedFiles(prev => [...prev, ...files]);
                }}
                selectedFiles={selectedFiles}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
