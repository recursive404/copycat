import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';

const SystemPrompts = ({ prompts, onPromptsChange }) => {
  const [newPrompt, setNewPrompt] = useState('');

  const addPrompt = () => {
    if (newPrompt.trim()) {
      onPromptsChange([...prompts, { text: newPrompt.trim(), enabled: true }]);
      setNewPrompt('');
    }
  };

  const togglePrompt = (index) => {
    const updatedPrompts = prompts.map((prompt, i) => 
      i === index ? { ...prompt, enabled: !prompt.enabled } : prompt
    );
    onPromptsChange(updatedPrompts);
  };

  const removePrompt = (index) => {
    onPromptsChange(prompts.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addPrompt();
    }
  };

  return (
    <div className="system-prompts">
      <div className="system-prompts-header">
        <h3>System Prompts</h3>
        <div className="add-prompt">
          <textarea
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a system prompt..."
          />
          <button onClick={addPrompt} disabled={!newPrompt.trim()}>
            <FontAwesomeIcon icon={faPlus} /> Add
          </button>
        </div>
      </div>
      <div className="system-prompts-list">
        {prompts.map((prompt, index) => (
          <div key={index} className="system-prompt-item">
            <button 
              className="toggle-button"
              onClick={() => togglePrompt(index)}
              title={prompt.enabled ? 'Disable prompt' : 'Enable prompt'}
            >
              <FontAwesomeIcon icon={prompt.enabled ? faToggleOn : faToggleOff} />
            </button>
            <div className="prompt-text">{prompt.text}</div>
            <button 
              className="remove-button"
              onClick={() => removePrompt(index)}
              title="Remove prompt"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemPrompts;
