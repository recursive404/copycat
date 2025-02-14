import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';

// Register languages
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('css', css);

const getLanguage = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const languageMap = {
    'jsx': 'jsx',
    'js': 'javascript',
    'css': 'css'
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

  return (
    <div className="preview-window">
      <div className="preview-header">
        <h2>Preview</h2>
      </div>
      <div className="preview-content">
        {files.map((file) => (
          <div key={file.path} className="file-preview-item">
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
                  onRemoveFile(file);
                }}
                title="Remove file"
              >
                <FontAwesomeIcon icon={faTrash} size="sm" />
              </div>
            </div>
            {!collapsedFiles.has(file.path) && (
              <div className="file-preview-content">
                <SyntaxHighlighter
                  language={getLanguage(file.name)}
                  style={solarizedlight}
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
