import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { loadFiles, saveFiles } from './utils/persistence';
import TitleBar from './components/TitleBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FileExplorer from './components/FileExplorer';
import PreviewWindow from './components/PreviewWindow';
import PromptInput from './components/PromptInput';
import Settings from './components/Settings';
import Modal from './components/Modal';
import SystemPrompts from './components/SystemPrompts';
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
  const [systemPrompts, setSystemPrompts] = useState(() => {
    const saved = localStorage.getItem('systemPrompts');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSystemPrompts, setShowSystemPrompts] = useState(false);

  // Save system prompts to localStorage
  useEffect(() => {
    localStorage.setItem('systemPrompts', JSON.stringify(systemPrompts));
  }, [systemPrompts]);
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

  // Memoize the concatenated file content
  const concatenatedFileContent = useMemo(() => 
    selectedFiles
      .map(file => `// ${file.name}\n${file.content}`)
      .join('\n\n'),
    [selectedFiles]
  );

  // Update preview content when relevant content changes
  useEffect(() => {
    let content = '';
    
    // 1. Enabled system prompts
    const enabledSystemPrompts = systemPrompts
      .filter(p => p.enabled)
      .map(p => p.text)
      .join('\n\n');
    if (enabledSystemPrompts) {
      content += enabledSystemPrompts + '\n\n';
    }
    
    // 2. User prompt
    if (prompt) {
      content += prompt + '\n\n';
    }
    
    // 3. Concatenated files
    content += concatenatedFileContent;
    
    setPreviewContent(content);
  }, [concatenatedFileContent, prompt, systemPrompts]);

    // Apply settings to the app
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--blur', `${settings.blur}px`);
    root.style.setProperty('--opacity', settings.opacity);
    
    if (settings.backgroundImage) {
      root.style.setProperty('--bg-image', `url(${settings.backgroundImage})`);
      root.style.setProperty('--bg-size', settings.backgroundScale || 'cover');
    } else {
      root.style.removeProperty('--bg-image');
      root.style.setProperty('--bg-size', 'cover');
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
        <div className="content-container">
          <PreviewWindow 
            files={selectedFiles}
            onRemoveFile={(file) => {
              setSelectedFiles(prev => prev.filter(f => f.path !== file.path));
            }}
            onSystemPromptsClick={() => setShowSystemPrompts(true)}
          />
          <div className="action-area">
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                systemPrompts={useMemo(() => systemPrompts, [systemPrompts])}
                selectedFiles={useMemo(() => selectedFiles, [selectedFiles])}
                onSystemPromptsClick={useCallback(() => setShowSystemPrompts(true), [])}
                onAddFilesClick={useCallback(() => setShowFileModal(true), [])}
                onRefreshFiles={useCallback(async () => {
                  try {
                    const refreshedFiles = await loadFiles();
                    setSelectedFiles(refreshedFiles);
                    toast.success('Files refreshed successfully');
                  } catch (error) {
                    toast.error('Failed to refresh files');
                  }
                }, [])}
                onClearFiles={useCallback(() => {
                  if (window.confirm('Are you sure you want to clear all files?')) {
                    setSelectedFiles([]);
                    toast.success('All files cleared');
                  }
                }, [])}
                onSubmit={useCallback(async () => {
                  try {
                    // Get enabled system prompts
                    const enabledSystemPrompts = systemPrompts
                      .filter(p => p.enabled)
                      .map(p => p.text)
                      .join('\n\n');
                    
                    // Build final text in desired order
                    let finalText = '';
                    
                    // 1. Enabled system prompts
                    if (enabledSystemPrompts) {
                      finalText += enabledSystemPrompts + '\n\n';
                    }
                    
                    // 2. User prompt
                    if (prompt) {
                      finalText += prompt + '\n\n';
                    }
                    
                    // 3. Concatenated files
                    finalText += concatenatedFileContent;

                    await navigator.clipboard.writeText(finalText);
                    toast.success('Copied to clipboard');
                  } catch (error) {
                    toast.error('Failed to copy files');
                  }
                }, [concatenatedFileContent, prompt, systemPrompts])}
              />
            </div>
        </div>

        <Modal
          isOpen={showSystemPrompts}
          onClose={() => setShowSystemPrompts(false)}
          title="System Prompts"
        >
          <SystemPrompts
            prompts={systemPrompts}
            onPromptsChange={setSystemPrompts}
          />
        </Modal>

        <Modal
          isOpen={showFileModal}
          onClose={() => setShowFileModal(false)}
          title="Select Files"
        >
          <FileExplorer
            onFilesSelected={(files) => {
              // Create a Map using file paths as keys to ensure uniqueness
              const uniqueFiles = new Map(
                [...selectedFiles, ...files].map(file => [file.path, file])
              );
              setSelectedFiles(Array.from(uniqueFiles.values()));
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
