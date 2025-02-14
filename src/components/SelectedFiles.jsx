import React from 'react';

const SelectedFiles = ({ files, onRemoveFile }) => {
  return (
    <div className="selected-files-view">
      <div className="file-list">
        {files.map((file) => (
          <div key={file.path} className="file-item">
            <span title={file.path}>{file.name}</span>
            <button
              className="icon-button"
              onClick={() => onRemoveFile(file)}
              title="Remove file"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedFiles;
