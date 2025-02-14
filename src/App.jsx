import React, { useState, useEffect, useCallback } from 'react';
import { loadFiles, saveFiles } from './utils/persistence';
import TitleBar from './components/TitleBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FileExplorer from './components/FileExplorer';
import PreviewWindow from './components/PreviewWindow';
import PromptInput from './components/PromptInput';
import Settings from './components/Settings';
import Modal from './components/Modal';
import './styles/main.css';

function App() {

  const [showSettings, setShowSettings] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Load saved files on startup
  useEffect(() => {
    const loadSavedFiles = async () => {
      try {
        const files = await loadFiles();
        if (files && files.length > 0) {
          setSelectedFiles(files);
        }
      } catch (error) {
        console.error('Error loading saved files:', error);
        toast.error('Failed to load saved files');
      }
    };
    loadSavedFiles();
  }, []);

  // Save files whenever they change
  useEffect(() => {
    if (selectedFiles.length > 0) {
      const success = saveFiles(selectedFiles);
      if (!success) {
        toast.error('Failed to save file list');
      }
    }
  }, [selectedFiles]);
  const [previewContent, setPreviewContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [workspace, setWorkspace] = useState(() => {
    const savedWorkspace = localStorage.getItem('workspace');
    return savedWorkspace ? JSON.parse(savedWorkspace) : null;
  });
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


  // Add event listener for settings toggle
  useEffect(() => {
    const handleSettingsToggle = () => setShowSettings(!showSettings);
    window.addEventListener('toggle-settings', handleSettingsToggle);
    return () => window.removeEventListener('toggle-settings', handleSettingsToggle);
  }, [showSettings]);

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


  // Save workspace to localStorage whenever it changes
  useEffect(() => {
    if (workspace) {
      localStorage.setItem('workspace', JSON.stringify(workspace));
    } else {
      localStorage.removeItem('workspace');
    }
  }, [workspace]);

  const resetSettings = () => {
    const defaultSettings = {
      backgroundImage: '',
      opacity: 1,
      blur: 0,
      scrollDirection: 'n',
      scrollSpeed: 1,
      backgroundScale: 'cover'
    };
    setSettings(defaultSettings);
    setWorkspace(null);
    setSelectedFiles([]);
    localStorage.clear();
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="app" style={{ opacity: settings.opacity }}>
      <TitleBar />
      <ToastContainer position="top-right" />
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
      >
        <Settings
          settings={settings}
          onSettingsChange={setSettings}
          workspace={workspace}
          setWorkspace={setWorkspace}
          selectedFiles={selectedFiles}
        />
      </Modal>
      <div className="main-container">
        <div className="file-controls">
          <button
            className="control-button"
            onClick={() => setShowFileModal(true)}
          >
            + Add Files
          </button>
          <button
            className="control-button"
            onClick={() => setSelectedFiles([])}
          >
            Clear All
          </button>
          <button
            className="control-button"
            onClick={async () => {
              try {
                const refreshedFiles = await loadFiles();
                setSelectedFiles(refreshedFiles);
                toast.success('Files refreshed successfully');
              } catch (error) {
                toast.error('Failed to refresh files');
              }
            }}
          >
            Refresh
          </button>
        </div>
        <PreviewWindow 
          files={selectedFiles}
          onRemoveFile={(file) => {
            setSelectedFiles(prev => prev.filter(f => f.path !== file.path));
          }}
        />
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          onSubmit={() => {/* TODO */}}
        />

        <Modal
          isOpen={showFileModal}
          onClose={() => setShowFileModal(false)}
          title="Select Files"
        >
          <FileExplorer
            onFilesSelected={(files) => {
              setSelectedFiles(prev => [...prev, ...files]);
              setShowFileModal(false);
            }}
            selectedFiles={selectedFiles}
            workspace={workspace}
          />
        </Modal>

      </div>
    </div>
  );
}

export default App;
