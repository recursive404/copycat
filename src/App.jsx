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
    } else {
      document.body.style.removeProperty('background-image');
    }

    // Apply scroll direction and speed to preview window
    const previewContent = document.querySelector('.preview-content');
    if (previewContent) {
      previewContent.style.setProperty(
        'overflow', 
        settings.scrollDirection === 'vertical' ? 'auto hidden' : 'hidden auto'
      );
      previewContent.style.setProperty('scroll-behavior', 'smooth');
    }
  }, [settings]);

  return (
    <div className="app" style={{ opacity: settings.opacity }}>
      <Settings settings={settings} onSettingsChange={setSettings} />
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
