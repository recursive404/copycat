import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/system-prompts.css';
import { faPlus, faTrash, faToggleOn, faToggleOff, faEdit, faSave } from '@fortawesome/free-solid-svg-icons';

const SystemPrompts = ({ prompts, onPromptsChange }) => {
  const [newPrompt, setNewPrompt] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState('');

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

  const startEditing = (index, text) => {
    setEditingIndex(index);
    setEditText(text);
  };

  const saveEdit = (index) => {
    const updatedPrompts = prompts.map((prompt, i) => 
      i === index ? { ...prompt, text: editText.trim() } : prompt
    );
    onPromptsChange(updatedPrompts);
    setEditingIndex(null);
    setEditText('');
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(prompts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onPromptsChange(items);
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
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="prompts">
          {(provided) => (
            <div 
              className="system-prompts-list"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {prompts.map((prompt, index) => (
                <Draggable key={index} draggableId={`prompt-${index}`} index={index}>
                  {(provided) => (
                    <div
                      className="system-prompt-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className="drag-handle" {...provided.dragHandleProps}>
                        &#x2630;
                      </div>
                      <button 
                        className="toggle-button"
                        onClick={() => togglePrompt(index)}
                        title={prompt.enabled ? 'Disable prompt' : 'Enable prompt'}
                      >
                        <FontAwesomeIcon icon={prompt.enabled ? faToggleOn : faToggleOff} />
                      </button>
                      {editingIndex === index ? (
                        <textarea
                          className="edit-textarea"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <div className="prompt-text">{prompt.text}</div>
                      )}
                      {editingIndex === index ? (
                        <button 
                          className="save-button"
                          onClick={() => saveEdit(index)}
                          title="Save changes"
                        >
                          <FontAwesomeIcon icon={faSave} />
                        </button>
                      ) : (
                        <button 
                          className="edit-button"
                          onClick={() => startEditing(index, prompt.text)}
                          title="Edit prompt"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      )}
                      <button 
                        className="remove-button"
                        onClick={() => removePrompt(index)}
                        title="Remove prompt"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default SystemPrompts;
