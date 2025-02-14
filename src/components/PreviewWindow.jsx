import React, { useState, useEffect } from 'react';
import { saveFiles } from '../utils/persistence';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const getLanguage = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const languageMap = {
    'jsx': 'jsx',
    'js': 'javascript',
    'css': 'css',
    'cpp': 'cpp',
    'h': 'cpp'
  };
  return languageMap[ext] || 'text';
};

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

  const [stickyHeaders, setStickyHeaders] = useState(new Set());

  useEffect(() => {
    const handleScroll = (e) => {
      const previewContent = e.target;
      const headers = previewContent.getElementsByClassName('file-preview-header');
      const newStickyHeaders = new Set();

      Array.from(headers).forEach((header) => {
        const rect = header.getBoundingClientRect();
        const parentRect = header.closest('.file-preview-item').getBoundingClientRect();
        
        if (parentRect.top <= rect.height && parentRect.bottom >= rect.height) {
          newStickyHeaders.add(header.closest('.file-preview-item').dataset.filePath);
        }
      });

      setStickyHeaders(newStickyHeaders);
    };

    const previewContent = document.querySelector('.preview-content');
    if (previewContent) {
      previewContent.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (previewContent) {
        previewContent.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div className="preview-window">
      <div className="preview-content" style={{ paddingTop: '0.5rem', position: 'relative' }}>
        {files.map((file, index) => (
          <div 
            key={`${file.path}-${index}`} 
            className="file-preview-item"
            data-file-path={file.path}
            style={{
              paddingTop: stickyHeaders.has(file.path) ? '3rem' : '1rem',
              borderBottom: 'none'
            }}
          >
            <div
              className="file-preview-header"
              onClick={(e) => {
                // Only trigger if click wasn't on the trash icon
                if (!e.target.closest('.remove-icon')) {
                  toggleCollapse(file.path);
                }
              }}
            >
              <div className="icon-container">
                <FontAwesomeIcon
                  icon={collapsedFiles.has(file.path) ? faChevronRight : faChevronDown}
                  size="sm"
                />
              </div>
              <h3 className="file-name" title={file.path}>{file.name}</h3>
              <div
                className="remove-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onRemoveFile(file);
                }}
                title="Remove file"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    e.preventDefault();
                    onRemoveFile(file);
                  }
                }}
              >
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </div>
            </div>
            {!collapsedFiles.has(file.path) && (
              <div className="file-preview-content">
                <SyntaxHighlighter
                  language={getLanguage(file.name)}
                  style={a11yDark}
                  showLineNumbers
                  lineNumberStyle={{ color: '#999', marginRight: '1em' }}
                  customStyle={{
                    backgroundColor: 'transparent',
                    padding: 0,
                    margin: 0
                  }}
                >
                  {file.content}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewWindow;
