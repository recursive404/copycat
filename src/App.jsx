import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const scrollIntervalRef = useRef(null);
  const scrollPositionRef = useRef({ x: 0, y: 0 });
  const slideshowIntervalRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeLayer, setActiveLayer] = useState(1);
  const [layer1Style, setLayer1Style] = useState({ opacity: 1 });
  const [layer2Style, setLayer2Style] = useState({ opacity: 0 });

  const getDirections = (speed) => {
    const multiplier = (speed || 5) / 3;
    return {
      'right': { x: multiplier, y: 0 },
      'left': { x: -multiplier, y: 0 },
      'up': { x: 0, y: -multiplier },
      'down': { x: 0, y: multiplier },
      'diagonal-up-right': { x: multiplier, y: -multiplier },
      'diagonal-up-left': { x: -multiplier, y: -multiplier },
      'diagonal-down-right': { x: multiplier, y: multiplier },
      'diagonal-down-left': { x: -multiplier, y: multiplier }
    };
  };

  const [showSettings, setShowSettings] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Load saved files on startup
  useEffect(() => {
    const loadSavedFiles = async () => {
      try {
        const files = await loadFiles(false); // Don't force refresh on initial load
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
    const initialSettings = savedSettings ? JSON.parse(savedSettings) : {
      backgroundSets: [],
      previewOpacity: 1,
      promptOpacity: 1,
      blur: 0,
      backgroundScale: 'cover',
      backgroundScroll: false,
      scrollDirection: 'right',
      scrollSpeed: 5,
      slideshowEnabled: false,
      slideshowInterval: 60,
      slideshowMode: 'sequential'
    };
    return initialSettings;
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

  // Memoize handlers and data to prevent unnecessary re-renders
  const handleRemoveFile = useCallback((file) => {
    setSelectedFiles(prev => prev.filter(f => f.path !== file.path));
  }, []);

  const handleSystemPromptsClick = useCallback(() => {
    setShowSystemPrompts(true);
  }, []);

  const handlePromptChange = useCallback((newPrompt) => {
    setPrompt(newPrompt);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      // Build content only when copying
      const content = [
        // 1. Enabled system prompts
        systemPrompts
          .filter(p => p.enabled)
          .map(p => p.text)
          .join('\n\n'),
        // 2. User prompt
        prompt,
        // 3. Concatenated files
        selectedFiles
          .map(file => `// ${file.name}\n${file.content}`)
          .join('\n\n')
      ].filter(Boolean).join('\n\n');

      await navigator.clipboard.writeText(content);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy files');
    }
  }, [selectedFiles, prompt, systemPrompts]);

  // Additional callbacks
  const handleAddFiles = useCallback(() => setShowFileModal(true), []);
  
  const handleRefreshFiles = useCallback(async () => {
    try {
      const refreshedFiles = await loadFiles(true);
      setSelectedFiles(refreshedFiles);
      toast.success('Files refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh files');
    }
  }, []);

  const handleClearFiles = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all files?')) {
      setSelectedFiles([]);
      toast.success('All files cleared');
    }
  }, []);

  // Memoize child components' props
  const handleFilesChange = useCallback((newFiles) => {
    setSelectedFiles(newFiles);
  }, []);

  const previewWindowProps = useMemo(() => ({
    files: selectedFiles,
    onRemoveFile: handleRemoveFile,
    onSystemPromptsClick: handleSystemPromptsClick,
    onAddFilesClick: handleAddFiles,
    onFilesChange: handleFilesChange
  }), [selectedFiles, handleRemoveFile, handleSystemPromptsClick, handleAddFiles, handleFilesChange]);

  const promptInputProps = useMemo(() => ({
    value: prompt,
    onChange: handlePromptChange,
    onSubmit: handleSubmit,
    onSystemPromptsClick: handleSystemPromptsClick,
    onAddFilesClick: handleAddFiles,
    onRefreshFiles: handleRefreshFiles,
    onClearFiles: handleClearFiles,
    systemPrompts,
    selectedFiles
  }), [
    prompt, 
    handlePromptChange, 
    handleSubmit, 
    handleSystemPromptsClick, 
    handleAddFiles,
    handleRefreshFiles,
    handleClearFiles,
    systemPrompts, 
    selectedFiles
  ]);

  // Reset image index when slideshow settings change
  useEffect(() => {
    if (settings.slideshowEnabled) {
      setCurrentImageIndex(0);
    }
  }, [settings.slideshowEnabled, settings.slideshowMode]);

  // Apply settings to the app
  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--blur', `${settings.blur}px`);
    root.style.setProperty('--preview-opacity', settings.previewOpacity);
    root.style.setProperty('--prompt-opacity', settings.promptOpacity);
    
    // Get enabled images from background sets
    const validImages = settings.backgroundSets
      ?.filter(set => set.enabled)
      .flatMap(set => set.images)
      .filter(img => img.enabled)
      .map(img => img.url)
      .filter(Boolean) || [];

    if (validImages.length > 0) {
      const currentImage = validImages[currentImageIndex];
      const layer1 = document.querySelector('.background-layer:first-child');
      const layer2 = document.querySelector('.background-layer:last-child');
      
      if (activeLayer === 1) {
        layer2.style.backgroundImage = `url(${currentImage})`;
        layer2.style.backgroundSize = settings.backgroundScale || 'cover';
        setLayer1Style({ opacity: 0 });
        setLayer2Style({ opacity: 1 });
        setActiveLayer(2);
      } else {
        layer1.style.backgroundImage = `url(${currentImage})`;
        layer1.style.backgroundSize = settings.backgroundScale || 'cover';
        setLayer1Style({ opacity: 1 });
        setLayer2Style({ opacity: 0 });
        setActiveLayer(1);
      }
    } else {
      setLayer1Style({ backgroundImage: 'none', opacity: 1 });
      setLayer2Style({ backgroundImage: 'none', opacity: 0 });
    }

    // Clear existing slideshow interval if any
    if (slideshowIntervalRef.current) {
      clearInterval(slideshowIntervalRef.current);
      slideshowIntervalRef.current = null;
    }

    // Setup slideshow if enabled and we have multiple images
    if (settings.slideshowEnabled && validImages.length > 1) {
      const getNextIndex = () => {
        const totalImages = validImages.length;
        
        switch (settings.slideshowMode) {
          case 'sequential':
            return (currentImageIndex + 1) % totalImages;
          
          case 'random':
            return Math.floor(Math.random() * totalImages);
          
          case 'random-no-repeat': {
            let nextIndex;
            do {
              nextIndex = Math.floor(Math.random() * totalImages);
            } while (totalImages > 1 && nextIndex === currentImageIndex);
            return nextIndex;
          }
          
          default:
            return (currentImageIndex + 1) % totalImages;
        }
      };

      slideshowIntervalRef.current = setInterval(() => {
        setCurrentImageIndex(getNextIndex());
      }, settings.slideshowInterval * 1000);
    }

    // Clear existing interval if any
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    // Handle background scroll
    if (settings.backgroundScroll) {
      const directions = getDirections(settings.scrollSpeed);
      const direction = directions[settings.scrollDirection || 'right'];
      
      scrollIntervalRef.current = setInterval(() => {
        scrollPositionRef.current = {
          x: (scrollPositionRef.current.x || 0) + direction.x,
          y: (scrollPositionRef.current.y || 0) + direction.y
        };
        
        // Apply scroll position to both layers to maintain consistent animation
        document.querySelectorAll('.background-layer').forEach(layer => {
          layer.style.backgroundPosition = `${scrollPositionRef.current.x}px ${scrollPositionRef.current.y}px`;
        });
      }, 20);
    }

    // Cleanup interval on unmount or settings change
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
        slideshowIntervalRef.current = null;
      }
    };
  }, [settings, currentImageIndex]);

  // Save workspace to localStorage whenever it changes
  useEffect(() => {
    if (workspace) {
      localStorage.setItem('workspace', JSON.stringify(workspace));
    } else {
      localStorage.removeItem('workspace');
    }
  }, [workspace]);

  const handleRandomize = useCallback(() => {
    if (settings.slideshowEnabled && settings.backgroundSets?.length > 0) {
      const validImages = settings.backgroundSets
        .filter(set => set.enabled)
        .flatMap(set => set.images)
        .filter(img => img.enabled)
        .map(img => img.url)
        .filter(Boolean);

      if (validImages.length > 1) {
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * validImages.length);
        } while (validImages.length > 1 && nextIndex === currentImageIndex);
        setCurrentImageIndex(nextIndex);
      }
    }
  }, [settings.slideshowEnabled, settings.backgroundSets, currentImageIndex]);

  const resetSettings = () => {
    const defaultSettings = {
      backgroundSets: [],
      previewOpacity: 1,
      promptOpacity: 1,
      blur: 0,
      backgroundScale: 'cover',
      backgroundScroll: false,
      scrollDirection: 'right',
      scrollSpeed: 5,
      slideshowEnabled: false,
      slideshowInterval: 60,
      slideshowMode: 'sequential'
    };
    setSettings(defaultSettings);
    setWorkspace(null);
    setSelectedFiles([]);
    localStorage.clear();
    toast.success('Settings reset to defaults');
  };

  return (
    <>
      <div className="app-background">
        <div className="background-layer" style={{ ...layer1Style, backgroundColor: settings.backgroundColor || '#1E1E1E' }} />
        <div className="background-layer" style={{ ...layer2Style, backgroundColor: settings.backgroundColor || '#1E1E1E' }} />
      </div>
      <div className="app">
        <TitleBar 
          slideshowEnabled={settings.slideshowEnabled}
          slideshowMode={settings.slideshowMode}
          onRandomize={handleRandomize}
        />
        <ToastContainer 
          position="top-center" 
          style={{ marginTop: '2.5rem' }} // Add space below title bar
          pauseOnFocusLoss={false} // Continue auto-close even when window loses focus
        />
        <div className="main-container">
          <div className="content-container">
            <PreviewWindow 
              {...previewWindowProps} 
              style={{ 
                opacity: settings.previewOpacity,
                height: `calc(100% - ${settings.promptHeight || '200px'})`,
                transition: 'height 0.1s ease'
              }} 
            />
            <div 
              className="resize-handle"
              onMouseDown={(e) => {
                const startY = e.clientY;
                const startHeight = settings.promptHeight ? parseInt(settings.promptHeight) : 200;
                
                const handleMouseMove = (e) => {
                  const delta = startY - e.clientY;
                  const newHeight = Math.max(100, Math.min(800, startHeight + delta));
                  onSettingsChange({
                    ...settings,
                    promptHeight: `${newHeight}px`
                  });
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
            <div 
              className="action-area" 
              style={{ 
                opacity: settings.promptOpacity,
                height: settings.promptHeight || '200px'
              }}
            >
              <PromptInput {...promptInputProps} />
            </div>
          </div>
        </div>
      </div>
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
    </>
  );
}

export default App;
