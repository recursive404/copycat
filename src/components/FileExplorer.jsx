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
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Fetch and aggregate files from all workspaces
  useEffect(() => {
    const fetchAllWorkspaceFiles = async () => {
      if (!workspace) {
        setAllFiles([]);
        setSearchResults([]);
        return;
      }

      try {
        // Handle both single workspace and array of workspaces
        const workspaces = Array.isArray(workspace) ? workspace : [workspace];
        
        // Fetch files from all workspaces
        const allWorkspaceFiles = await Promise.all(
          workspaces.map(async (ws) => {
            if (!ws || !ws.path) return [];
            try {
              const refreshed = await ipcRenderer.invoke('refresh-workspace', ws.path);
              // Add workspace info to each file
              return (refreshed?.files || []).map(file => {
                // Normalize paths to use forward slashes
                const normalizedFilePath = file.path.replace(/\\/g, '/');
                const normalizedWorkspacePath = ws.path.replace(/\\/g, '/');
                
                // Remove workspace path and any leading slashes
                const relativePath = normalizedFilePath
                  .replace(normalizedWorkspacePath, '')
                  .replace(/^[/\\]+/, '');

                return {
                  ...file,
                  workspaceLabel: ws.label,
                  relativePath
                };
              });
            } catch (error) {
              console.error(`Error fetching files for workspace ${ws.path}:`, error);
              return [];
            }
          })
        );

        // Flatten and combine all files
        const combinedFiles = allWorkspaceFiles.flat();
        
        if (combinedFiles.length > 0) {
          setAllFiles(combinedFiles);
          // Show first 50 files initially
          setSearchResults(combinedFiles.slice(0, 50));
        } else {
          setAllFiles([]);
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error fetching workspace files:', error);
        setAllFiles([]);
        setSearchResults([]);
      }
    };

    fetchAllWorkspaceFiles();
  }, [workspace]);

  // Dedicated effect for handling input focus
  useEffect(() => {
    const focusInput = () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    };

    // Focus on mount and when workspace changes
    focusInput();

    // Add click handler to container to ensure input is focusable
    const container = document.querySelector('.file-explorer');
    if (container) {
      container.addEventListener('click', focusInput);
    }

    // Cleanup
    return () => {
      if (container) {
        container.removeEventListener('click', focusInput);
      }
    };
  }, [workspace]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    
    const results = query ? 
      fuzzysort.go(query, allFiles, {
        key: 'relativePath',
        limit: 50,
        threshold: -10000,
      }).map(result => result.obj) :
      allFiles.slice(0, 100); // Show first 100 files when no query

    setSearchResults(results);
    setFocusedIndex(-1); // Reset focus when search results change
  }, [allFiles]);

  // Initialize search results when files are loaded
  useEffect(() => {
    if (allFiles.length > 0) {
      handleSearch('');
    }
  }, [allFiles, handleSearch]);

  const toggleFileSelection = (file) => {
    if (selectedFiles.some(f => f.relativePath === file.relativePath)) return; // Prevent selecting already added files
    
    const newSelected = new Set(selectedSearchResults);
    if (newSelected.has(file.relativePath)) {
      newSelected.delete(file.relativePath);
    } else {
      newSelected.add(file.relativePath);
    }
    setSelectedSearchResults(newSelected);
  };

  const handleKeyDown = (e) => {
    const maxIndex = searchResults.length - 1;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, maxIndex));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case ' ': // Space
        e.preventDefault();
        if (focusedIndex >= 0) {
          toggleFileSelection(searchResults[focusedIndex]);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSearchResults.size > 0) {
          addSelectedFiles();
        }
        break;
      default:
        break;
    }
  };

  const addSelectedFiles = async () => {
    if (!workspace) {
      console.error('Please select a workspace in Settings first');
      return;
    }

    // Get only the newly selected files that aren't already in selectedFiles
    const newRelativePaths = Array.from(selectedSearchResults)
      .filter(relativePath => !selectedFiles.some(f => f.relativePath === relativePath));

    if (newRelativePaths.length === 0) {
      setSelectedSearchResults(new Set());
      setSearchQuery('');
      return;
    }

    const filesToAdd = await Promise.all(
      newRelativePaths.map(async (relativePath) => {
        const file = allFiles.find(f => f.relativePath === relativePath);
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
    // Restore focus to search input after adding files
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="file-explorer">
      <div className="file-explorer-workspace-info">
        <div className="workspace-header">
          <span className="workspace-path" title="Current Workspaces">
            {allFiles.length > 0 ? (
              <>
                Files found: {allFiles.length} from {Array.isArray(workspace) ? workspace.length : 1} workspace{Array.isArray(workspace) && workspace.length !== 1 ? 's' : ''}
              </>
            ) : 'No workspace selected'}
          </span>
        </div>
        <div className="search-box">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search files... (↑↓ to navigate, Space to select, Enter to add)"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              // Prevent losing focus when clicking within the file explorer
              if (e.relatedTarget?.closest('.file-explorer')) {
                e.target.focus();
              }
            }}
            autoFocus
          />
        </div>
      </div>

      <div className="search-results">
          {searchResults.map((file) => (
            <div
              key={file.relativePath}
              className={`search-result ${
                selectedSearchResults.has(file.relativePath) ? 'selected' : ''
              } ${selectedFiles.some(f => f.relativePath === file.relativePath) ? 'already-added' : ''
              } ${searchResults.indexOf(file) === focusedIndex ? 'focused' : ''}`}
              onClick={() => {
                // Prevent selecting already added files
                if (!selectedFiles.some(f => f.relativePath === file.relativePath)) {
                  toggleFileSelection(file);
                }
              }}
              title={selectedFiles.some(f => f.relativePath === file.relativePath) ? 'File already added to preview' : file.path}
            >
              <div className="file-info">
                <span className="file-path">{file.relativePath}</span>
                <span className="workspace-label">{file.workspaceLabel}</span>
              </div>
              {selectedFiles.some(f => f.relativePath === file.relativePath) && (
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
