import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/prompt-input.css';
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
  const [metrics, setMetrics] = useState({ lines: 0, tokens: 0, size: '0 B' });
  const [isCalculating, setIsCalculating] = useState(false);

  // Debounced metrics calculation
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      // Build full content similar to copy operation
      const content = [
        // 1. Enabled system prompts
        systemPrompts
          .filter(p => p.enabled)
          .map(p => p.text)
          .join('\n\n'),
        // 2. User prompt
        value,
        // 3. Concatenated files
        selectedFiles
          .map(file => `// ${file.name}\n${file.content}`)
          .join('\n\n')
      ].filter(Boolean).join('\n\n');

      setMetrics({
        lines: countLines(content),
        tokens: estimateTokens(content),
        size: formatFileSize(new TextEncoder().encode(content).length)
      });
      setIsCalculating(false);
    }, 1000); // Only update metrics 1 second after last change

    return () => clearTimeout(timer);
  }, [value, selectedFiles, systemPrompts]);
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
          {isCalculating ? (
            <span className="calculating">Calculating...</span>
          ) : (
            <span>Total: {metrics.lines} lines • ~{metrics.tokens} tokens • {metrics.size}</span>
          )}
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
