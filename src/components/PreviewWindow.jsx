import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { saveFiles } from '../utils/persistence';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/preview-window.css';
import { faChevronDown, faChevronRight, faTrash, faRobot } from '@fortawesome/free-solid-svg-icons';
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

// Memoized component for individual file preview
const FilePreview = React.memo(({ 
  file, 
  isCollapsed, 
  onToggleCollapse, 
  onRemove, 
  isSticky,
  dragHandleProps
}) => {
  return (
    <div 
      className="file-preview-item"
      data-file-path={file.path}
      style={{
        paddingTop: isSticky ? '3rem' : '1rem',
        borderBottom: 'none'
      }}
    >
      <div
        className="file-preview-header"
        onClick={(e) => {
          if (!e.target.closest('.remove-icon') && !e.target.closest('.drag-handle')) {
            onToggleCollapse(file.path);
          }
        }}
      >
        {isCollapsed && dragHandleProps && (
          <div className="drag-handle" {...dragHandleProps}>
            &#x2630;
          </div>
        )}
        <div className="icon-container">
          <FontAwesomeIcon
            icon={isCollapsed ? faChevronRight : faChevronDown}
            size="sm"
          />
        </div>
        <h3 className="file-name" title={file.path}>{file.name}</h3>
        <div className="header-actions">
          <div
            className="remove-icon"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onRemove(file);
            }}
            title="Remove file"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                e.preventDefault();
                onRemove(file);
              }
            }}
          >
            <FontAwesomeIcon icon={faTrash} size="sm" />
          </div>
        </div>
      </div>
      {!isCollapsed && (
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
  );
});

const PreviewWindow = ({ files, onRemoveFile, onSystemPromptsClick, onAddFilesClick, style, onFilesChange }) => {
  const [collapsedFiles, setCollapsedFiles] = useState(new Set());

  const toggleCollapse = useCallback((path) => {
    setCollapsedFiles(prev => {
      const newCollapsed = new Set(prev);
      if (newCollapsed.has(path)) {
        newCollapsed.delete(path);
      } else {
        newCollapsed.add(path);
      }
      return newCollapsed;
    });
  }, []);

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

  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;
    
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onFilesChange(items);
  }, [files, onFilesChange]);

  return (
    <div className="preview-window" style={style}>
      <div className="preview-content" style={{ 
        position: 'relative',
        overflowY: files.length > 0 ? 'auto' : 'hidden'
      }}>
        {files.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="files">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {files.map((file, index) => (
                    <Draggable
                      key={file.path}
                      draggableId={file.path}
                      index={index}
                      isDragDisabled={!collapsedFiles.has(file.path)}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            background: snapshot.isDragging ? 'var(--hover-bg)' : 'transparent'
                          }}
                        >
                          <FilePreview
                            file={file}
                            isCollapsed={collapsedFiles.has(file.path)}
                            onToggleCollapse={toggleCollapse}
                            onRemove={onRemoveFile}
                            isSticky={stickyHeaders.has(file.path)}
                            dragHandleProps={collapsedFiles.has(file.path) ? provided.dragHandleProps : null}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="empty-preview" onClick={onAddFilesClick} style={{ height: '100%' }}>
            <div className="empty-preview-content" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <h3>No Files Added</h3>
              <p>Click here to add files to your project</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(PreviewWindow);
