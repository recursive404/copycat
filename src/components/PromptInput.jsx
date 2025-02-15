import React from 'react';

const PromptInput = ({ value, onChange, onSubmit }) => {
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
          <i className="fas fa-copy"></i>
        </button>
      </div>
    </div>
  );
};

export default PromptInput;
