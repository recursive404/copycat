import React, { useState, useEffect, useCallback, useRef } from 'react';
import fuzzysort from 'fuzzysort';
import '../styles/file-explorer.css';
const { ipcRenderer } = window.require('electron');

const FileExplorer = ({ onFilesSelected, selectedFiles, workspace }) => {
  const [allFiles, setAllFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);
  const [selectedSearchResults, setSelectedSearchResults] = useState(new Set());

  // Use workspace from settings
  useEffect(() => {
    if (workspace) {
      setAllFiles(workspace.files);
      // Show first 50 files initially
      setSearchResults(workspace.files.slice(0, 50));
      // Focus search input
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } else {
      setAllFiles([]);
      setSearchResults([]);
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
      allFiles.slice(0, 100); // Show first 100 files when no query

    setSearchResults(results);
  }, [allFiles]);

  // Initialize search results when files are loaded
  useEffect(() => {
    if (allFiles.length > 0) {
      handleSearch('');
    }
  }, [allFiles, handleSearch]);

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

    // Get only the newly selected files that aren't already in selectedFiles
    const newFilePaths = Array.from(selectedSearchResults)
      .filter(path => !selectedFiles.some(f => f.path === path));

    if (newFilePaths.length === 0) {
      setSelectedSearchResults(new Set());
      setSearchQuery('');
      return;
    }

    const filesToAdd = await Promise.all(
      newFilePaths.map(async (path) => {
        const file = allFiles.find(f => f.path === path);
        const content = await ipcRenderer.invoke('read-file', path);
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
            ref={searchInputRef}
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="search-results">
          {searchResults.map((file) => (
            <div
              key={file.path}
              className={`search-result ${
                selectedSearchResults.has(file.path) ? 'selected' : ''
              } ${selectedFiles.some(f => f.path === file.path) ? 'already-added' : ''}`}
              onClick={() => {
                // Prevent selecting already added files
                if (!selectedFiles.some(f => f.path === file.path)) {
                  toggleFileSelection(file);
                }
              }}
              title={selectedFiles.some(f => f.path === file.path) ? 'File already added to preview' : file.path}
            >
              <span>{file.path}</span>
              {selectedFiles.some(f => f.path === file.path) && (
                <span className="already-added-indicator">Already added</span>
              )}
            </div>
          ))}
          {selectedSearchResults.size > 0 && (
            <div className="search-actions">
              <button 
                onClick={addSelectedFiles}
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add {selectedSearchResults.size} file(s)
              </button>
            </div>
          )}
        </div>

    </div>
  );

};

export default FileExplorer;
