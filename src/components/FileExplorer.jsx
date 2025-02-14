import React, { useState, useEffect, useCallback } from 'react';
import fuzzysort from 'fuzzysort';
const { ipcRenderer } = window.require('electron');

const FileExplorer = ({ onFilesSelected, selectedFiles }) => {
  const [allFiles, setAllFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchResults, setSelectedSearchResults] = useState(new Set());

  // Load workspace and files when component mounts
  useEffect(() => {
    const loadWorkspace = async () => {
      const workspace = await ipcRenderer.invoke('get-workspace');
      if (workspace) {
        setAllFiles(workspace.files);
        // Show initial results
        handleSearch('');
      }
    };
    loadWorkspace();
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    
    const results = query ? 
      fuzzysort.go(query, allFiles, {
        key: 'path',
        limit: 50,
        threshold: -10000,
      }).map(result => result.obj) :
      allFiles.slice(0, 50); // Show first 50 files when no query

    setSearchResults(results);
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
          const content = await ipcRenderer.invoke('read-file', file.path);
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
      <div className="workspace-info">
        <div className="workspace-header">
          <span className="workspace-path" title="Current Workspace">Current Workspace</span>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

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
              <span title={file.path.replace(workspaceRoot + '/', '')}>{file.name}</span>
              <button
                className="icon-button"
                onClick={() => {
                  onFilesSelected(selectedFiles.filter(f => f.path !== file.path));
                }}
                title="Remove file"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

};

export default FileExplorer;
