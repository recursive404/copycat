import React from 'react';

const PromptInput = ({ value, onChange, onSubmit }) => {
  const handleKeyPress = (e) => {
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
        onKeyPress={handleKeyPress}
        placeholder="Enter your prompt here..."
      />
      <button onClick={onSubmit}>Copy</button>
    </div>
  );
};

export default PromptInput;
