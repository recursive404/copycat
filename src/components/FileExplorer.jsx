import React, { useState, useEffect, useCallback } from 'react';
import fuzzysort from 'fuzzysort';
const { ipcRenderer } = window.require('electron');

const FileExplorer = ({ onFilesSelected, selectedFiles }) => {
  const [workspaceRoot, setWorkspaceRoot] = useState('');
  const [allFiles, setAllFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchResults, setSelectedSearchResults] = useState(new Set());

  const handleSelectWorkspace = async () => {
    const result = await ipcRenderer.invoke('select-directory');
    if (result) {
      setWorkspaceRoot(result.path);
      setAllFiles(result.files);
    }
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    const results = fuzzysort.go(query, allFiles, {
      key: 'path',
      limit: 50,
      threshold: -10000,
    });

    setSearchResults(results.map(result => result.obj));
  }, [allFiles]);

  const toggleFileSelection = (file) => {
    const newSelected = new Set(selectedSearchResults);
    if (newSelected.has(file.path)) {
      newSelected.delete(file.path);
    } else {
      newSelected.add(file.path);
    }
    setSelectedSearchResults(newSelected);
  };

  const addSelectedFiles = async () => {
    const filesToAdd = await Promise.all(
      allFiles
        .filter(file => selectedSearchResults.has(file.path))
        .map(async (file) => {
          const content = await fs.readFile(file.path, 'utf8');
          return {
            ...file,
            content
          };
        })
    );
    onFilesSelected([...selectedFiles, ...filesToAdd]);
    setSelectedSearchResults(new Set());
    setSearchQuery('');
  };

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <h2>Workspace Files</h2>
        <button onClick={handleSelectWorkspace}>
          {workspaceRoot ? 'Change Workspace' : 'Set Workspace'}
        </button>
      </div>
      
      {workspaceRoot && (
        <div className="workspace-info">
          <span className="workspace-path">{workspaceRoot}</span>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {searchQuery && (
        <div className="search-results">
          {searchResults.map((file) => (
            <div
              key={file.path}
              className={`search-result ${selectedSearchResults.has(file.path) ? 'selected' : ''}`}
              onClick={() => toggleFileSelection(file)}
            >
              <span>{file.path.replace(workspaceRoot + '/', '')}</span>
            </div>
          ))}
          {selectedSearchResults.size > 0 && (
            <div className="search-actions">
              <button onClick={addSelectedFiles}>
                Add {selectedSearchResults.size} file(s)
              </button>
            </div>
          )}
        </div>
      )}

      <div className="selected-files">
        <h3>Selected Files</h3>
        <div className="file-list">
          {selectedFiles.map((file) => (
            <div key={file.path} className="file-item">
              <span>{file.path.replace(workspaceRoot + '/', '')}</span>
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
    </div>
  );
};

export default FileExplorer;
