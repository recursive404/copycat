import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPlus, faSync, faTrash, faCopy } from '@fortawesome/free-solid-svg-icons';
import { estimateTokens, formatFileSize, countLines } from '../utils/metrics';

const PromptInput = ({ 
  value, 
  onChange, 
  onSubmit,
  onSystemPromptsClick,
  onAddFilesClick,
  onRefreshFiles,
  onClearFiles,
  systemPrompts = [],
  selectedFiles = []
}) => {
  const [metrics, setMetrics] = useState({
    lines: 0,
    tokens: 0,
    size: '0 B'
  });

  // Memoize the concatenated file content
  const fileContent = useMemo(() => 
    selectedFiles
      .map(file => `// ${file.name}\n${file.content}`)
      .join('\n\n'),
    [selectedFiles]
  );

  // Memoize the concatenated system prompts
  const systemPromptsContent = useMemo(() =>
    systemPrompts
      .filter(p => p.enabled)
      .map(p => p.text)
      .join('\n'),
    [systemPrompts]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const fullContent = `${systemPromptsContent}\n\n${fileContent}\n\n${value}`;
      
      setMetrics({
        lines: countLines(fullContent),
        tokens: estimateTokens(fullContent),
        size: formatFileSize(new TextEncoder().encode(fullContent).length)
      });
    }, 800); // Increased debounce delay for smoother experience

    return () => clearTimeout(timer);
  }, [value, fileContent, systemPromptsContent]);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="prompt-input">
      <div className="textarea-container">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your prompt here..."
        />
        <div className="prompt-metrics">
          {metrics.lines} lines • {metrics.tokens} tokens • {metrics.size}
        </div>
      </div>
      <div className="prompt-actions">
        <button className="primary-action" onClick={onSubmit}>
          <FontAwesomeIcon icon={faCopy} />
        </button>
        <div className="secondary-actions-grid">
          <button
            className="action-button"
            onClick={onSystemPromptsClick}
            title="System Prompts"
          >
            <FontAwesomeIcon icon={faRobot} />
          </button>
          <button
            className="action-button"
            onClick={onAddFilesClick}
            title="Add Files"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <button
            className="action-button"
            onClick={onRefreshFiles}
            title="Refresh Files"
          >
            <FontAwesomeIcon icon={faSync} />
          </button>
          <button
            className="action-button danger"
            onClick={onClearFiles}
            title="Clear All Files"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
