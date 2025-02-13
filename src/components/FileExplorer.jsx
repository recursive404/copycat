import React from 'react';
const { ipcRenderer } = window.require('electron');

const FileExplorer = ({ onFilesSelected, selectedFiles }) => {
  const handleFileSelect = async () => {
    const files = await ipcRenderer.invoke('open-file-dialog');
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <h2>Selected Files</h2>
        <button onClick={handleFileSelect}>Add Files</button>
      </div>
      <div className="file-list">
        {selectedFiles.map((file) => (
          <div key={file.path} className="file-item">
            <span>{file.name}</span>
            <button
              onClick={() => {
                onFilesSelected(selectedFiles.filter(f => f.path !== file.path));
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
