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
      const scrollSpeed = parseFloat(settings.scrollSpeed) || 0;
      const direction = settings.scrollDirection || 'n';
      
      // Stop any existing animation
      if (previewContent._scrollInterval) {
        clearInterval(previewContent._scrollInterval);
        previewContent._scrollInterval = null;
      }

      if (scrollSpeed > 0) {
        const getScrollAmounts = () => {
          const base = scrollSpeed * 0.5; // Adjust base speed
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

        // Use setInterval for more consistent scrolling
        previewContent._scrollInterval = setInterval(() => {
          const { x, y } = getScrollAmounts();
          previewContent.scrollBy(x, y);

          // Handle scroll boundaries
          const atTop = previewContent.scrollTop <= 0;
          const atBottom = previewContent.scrollTop + previewContent.clientHeight >= previewContent.scrollHeight;
          const atLeft = previewContent.scrollLeft <= 0;
          const atRight = previewContent.scrollLeft + previewContent.clientWidth >= previewContent.scrollWidth;

          // Reset position if we hit boundaries
          if ((atTop && y < 0) || (atBottom && y > 0) || 
              (atLeft && x < 0) || (atRight && x > 0)) {
            if (y < 0 || x < 0) {
              // If scrolling up/left, jump to bottom/right
              previewContent.scrollTop = previewContent.scrollHeight;
              previewContent.scrollLeft = previewContent.scrollWidth;
            } else {
              // If scrolling down/right, jump to top/left
              previewContent.scrollTop = 0;
              previewContent.scrollLeft = 0;
            }
          }
        }, 16); // ~60fps
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
