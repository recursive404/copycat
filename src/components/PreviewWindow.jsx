import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight, faTrash } from '@fortawesome/free-solid-svg-icons';

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
    <div className="preview-window">
      <div className="preview-header">
        <h2>Preview</h2>
      </div>
      <div className="preview-content">
        {files.map((file) => (
          <div key={file.path} className="file-preview-item">
            <div className="file-preview-header">
              <button 
                className="icon-button"
                onClick={() => toggleCollapse(file.path)}
                title={collapsedFiles.has(file.path) ? 'Expand' : 'Collapse'}
              >
                <FontAwesomeIcon 
                  icon={collapsedFiles.has(file.path) ? faChevronRight : faChevronDown} 
                  size="sm"
                />
              </button>
              <h3 className="file-name" title={file.path}>{file.name}</h3>
              <div 
                className="remove-icon"
                onClick={() => onRemoveFile(file)}
                title="Remove file"
              >
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </div>
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
