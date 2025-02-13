import React, { useState } from 'react';
import { dialog } from '@electron/remote';
import fs from 'fs';
import path from 'path';

const FileExplorer = ({ onFilesSelected, selectedFiles }) => {
  const handleFileSelect = async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections']
    });

    if (!result.canceled) {
      const files = await Promise.all(
        result.filePaths.map(async (filePath) => {
          const content = await fs.promises.readFile(filePath, 'utf8');
          return {
            path: filePath,
            name: path.basename(filePath),
            content
          };
        })
      );
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
