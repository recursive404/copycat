import React, { useState } from 'react';
import FileExplorer from './components/FileExplorer';
import PreviewWindow from './components/PreviewWindow';
import PromptInput from './components/PromptInput';
import './styles/main.css';

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewContent, setPreviewContent] = useState('');
  const [prompt, setPrompt] = useState('');

  // Update preview content when files change
  React.useEffect(() => {
    const content = selectedFiles
      .map(file => `// ${file.name}\n${file.content}`)
      .join('\n\n');
    setPreviewContent(content);
  }, [selectedFiles]);

  return (
    <div className="app">
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
