import React from 'react';

const PromptInput = ({ value, onChange, onSubmit }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
      .then(() => {
        onSubmit();
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div className="prompt-input">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your prompt here..."
      />
      <button onClick={handleCopy}>Copy</button>
    </div>
  );
};

export default PromptInput;
