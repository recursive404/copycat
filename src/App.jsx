import React, { useState, useEffect } from 'react';
import FileExplorer from './components/FileExplorer';
import PreviewWindow from './components/PreviewWindow';
import PromptInput from './components/PromptInput';
import Settings from './components/Settings';
import './styles/main.css';

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewContent, setPreviewContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [settings, setSettings] = useState({
    backgroundImage: '',
    opacity: 1,
    blur: 0,
    scrollDirection: 'vertical',
    scrollSpeed: 1
  });

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
        keyframes = '@keyframes bgScroll { from { background-position: 50% 100%; } to { background-position: 50% 0%; } }';
        break;
      case 's':
        keyframes = '@keyframes bgScroll { from { background-position: 50% 0%; } to { background-position: 50% 100%; } }';
        break;
      case 'e':
        keyframes = '@keyframes bgScroll { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }';
        break;
      case 'w':
        keyframes = '@keyframes bgScroll { from { background-position: 100% 50%; } to { background-position: 0% 50%; } }';
        break;
      case 'ne':
        keyframes = '@keyframes bgScroll { from { background-position: 0% 100%; } to { background-position: 100% 0%; } }';
        break;
      case 'nw':
        keyframes = '@keyframes bgScroll { from { background-position: 100% 100%; } to { background-position: 0% 0%; } }';
        break;
      case 'se':
        keyframes = '@keyframes bgScroll { from { background-position: 0% 0%; } to { background-position: 100% 100%; } }';
        break;
      case 'sw':
        keyframes = '@keyframes bgScroll { from { background-position: 100% 0%; } to { background-position: 0% 100%; } }';
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
      document.body.style.setProperty('--bg-animation', `bgScroll ${duration}s linear infinite`);
    } else {
      document.body.style.setProperty('--bg-animation', 'none');
    }
  }, [settings]);

  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="app" style={{ opacity: settings.opacity }}>
      <button 
        className="settings-toggle" 
        onClick={() => setShowSettings(!showSettings)}
        title="Toggle Settings"
      >
        ⚙️
      </button>
      {showSettings && <Settings settings={settings} onSettingsChange={setSettings} />}
      <div className="main-container">
        <FileExplorer 
          onFilesSelected={setSelectedFiles} 
          selectedFiles={selectedFiles}
        />
        <div className="right-panel">
          <PreviewWindow content={previewContent} />
          <PromptInput 
            value={prompt}
            onChange={setPrompt}
            onSubmit={() => {/* TODO */}}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
