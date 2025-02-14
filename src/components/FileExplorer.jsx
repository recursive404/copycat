import React, { useState, useEffect, useCallback } from 'react';
import fuzzysort from 'fuzzysort';
const { ipcRenderer } = window.require('electron');

const FileExplorer = ({ onFilesSelected, selectedFiles, workspace }) => {
  const [allFiles, setAllFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchResults, setSelectedSearchResults] = useState(new Set());

  // Use workspace from settings
  useEffect(() => {
    if (workspace) {
      setAllFiles(workspace.files);
      handleSearch('');
    } else {
      setAllFiles([]);
    }
  }, [workspace]);

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
    if (!workspace) {
      toast.error('Please select a workspace in Settings first');
      return;
    }
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
          <span className="workspace-path" title="Current Workspace">
            {allFiles.length > 0 ? `Files found: ${allFiles.length}` : 'No workspace selected'}
          </span>
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
              <span>{file.path}</span>
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
              <span title={file.path}>{file.name}</span>
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
