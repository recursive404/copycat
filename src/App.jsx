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

    // Apply scroll direction and speed to preview window
    const previewContent = document.querySelector('.preview-content');
    if (previewContent) {
      const scrollSpeed = settings.scrollSpeed || 1;
      const direction = settings.scrollDirection || 'n';
      
      // Calculate scroll amounts based on direction
      const getScrollAmounts = () => {
        const base = 2 * scrollSpeed;
        const diagonal = base * 0.7071; // cos(45°) ≈ 0.7071
        
        switch(direction) {
          case 'n': return { x: 0, y: -base };
          case 'ne': return { x: diagonal, y: -diagonal };
          case 'e': return { x: base, y: 0 };
          case 'se': return { x: diagonal, y: diagonal };
          case 's': return { x: 0, y: base };
          case 'sw': return { x: -diagonal, y: diagonal };
          case 'w': return { x: -base, y: 0 };
          case 'nw': return { x: -diagonal, y: -diagonal };
          default: return { x: 0, y: 0 };
        }
      };

      const scroll = () => {
        const { x, y } = getScrollAmounts();
        previewContent.scrollBy(x, y);
        if (settings.scrollSpeed > 0) {
          requestAnimationFrame(scroll);
        }
      };

      // Clear any existing scroll animation
      if (previewContent._scrollAnimation) {
        cancelAnimationFrame(previewContent._scrollAnimation);
      }

      if (settings.scrollSpeed > 0) {
        previewContent._scrollAnimation = requestAnimationFrame(scroll);
      }
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
