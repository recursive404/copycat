import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPlus, faSync, faTrash, faCopy } from '@fortawesome/free-solid-svg-icons';

const PromptInput = ({ 
  value, 
  onChange, 
  onSubmit,
  onSystemPromptsClick,
  onAddFilesClick,
  onRefreshFiles,
  onClearFiles 
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="prompt-input">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your prompt here..."
      />
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
