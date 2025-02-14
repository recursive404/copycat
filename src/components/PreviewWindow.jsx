import React, { useState } from 'react';

const PreviewWindow = ({ files, onRemoveFile }) => {
  const [collapsedFiles, setCollapsedFiles] = useState(new Set());

  const toggleCollapse = (path) => {
    const newCollapsed = new Set(collapsedFiles);
    if (newCollapsed.has(path)) {
      newCollapsed.delete(path);
    } else {
      newCollapsed.add(path);
    }
    setCollapsedFiles(newCollapsed);
  };

  return (
    <div className="preview-window" style={{
      backgroundColor: 'var(--secondary-bg)',
      borderRadius: '8px',
      border: '1px solid var(--border-color)'
    }}>
      <div className="preview-header">
        <h2>Preview</h2>
      </div>
      <div className="preview-content">
        {files.map((file) => (
          <div key={file.path} className="file-preview-row">
            <div className="file-preview-header">
              <button 
                className="collapse-button"
                onClick={() => toggleCollapse(file.path)}
              >
                {collapsedFiles.has(file.path) ? '▶' : '▼'}
              </button>
              <span className="file-name" title={file.path}>{file.name}</span>
              <button
                className="remove-button"
                onClick={() => onRemoveFile(file)}
                title="Remove file"
              >
                🗑️
              </button>
            </div>
            {!collapsedFiles.has(file.path) && (
              <div className="file-preview-content">
                <pre>{file.content}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewWindow;
