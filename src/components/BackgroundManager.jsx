import React, { useState, useEffect } from 'react';
import '../styles/background-manager.css';

const BackgroundManager = ({ images, onChange = () => {}, sets = [], onSetsChange }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [newSetName, setNewSetName] = useState('');
  const [showNewSetInput, setShowNewSetInput] = useState(false);
  const [expandedSets, setExpandedSets] = useState({});

  // Initialize sets with image enable states if they don't exist
  useEffect(() => {
    const updatedSets = sets.map(set => ({
      ...set,
      images: set.images.map(img => 
        typeof img === 'string' ? { url: img, enabled: true } : img
      )
    }));
    if (JSON.stringify(updatedSets) !== JSON.stringify(sets)) {
      onSetsChange(updatedSets);
    }
  }, []);
  
  const handleMouseEnter = (imageUrl, event) => {
    const rect = event.target.getBoundingClientRect();
    setPreviewUrl(imageUrl);
    setPreviewPosition({
      x: rect.right + 10,
      y: rect.top
    });
  };

  const handleMouseLeave = () => {
    setPreviewUrl(null);
  };

  const handleAddImage = (setId) => {
    const newSets = sets.map(set => {
      if (set.id === setId) {
        return {
          ...set,
          images: [...set.images, { url: '', enabled: true }]
        };
      }
      return set;
    });
    onSetsChange(newSets);
  };

  const handleRemoveImage = (setId, index) => {
    const newSets = sets.map(set => {
      if (set.id === setId) {
        const newImages = [...set.images];
        newImages.splice(index, 1);
        return {
          ...set,
          images: newImages
        };
      }
      return set;
    });
    onSetsChange(newSets);
  };

  const handleUpdateImage = (setId, index, value) => {
    const newSets = sets.map(set => {
      if (set.id === setId) {
        const newImages = [...set.images];
        newImages[index] = { ...newImages[index], url: value };
        return {
          ...set,
          images: newImages
        };
      }
      return set;
    });
    onSetsChange(newSets);
  };

  const handleToggleImage = (setId, index) => {
    const newSets = sets.map(set => {
      if (set.id === setId) {
        const newImages = [...set.images];
        newImages[index] = { 
          ...newImages[index], 
          enabled: !newImages[index].enabled 
        };
        return {
          ...set,
          images: newImages
        };
      }
      return set;
    });
    onSetsChange(newSets);
    
    // Update active images based on enabled sets and images
    const enabledImages = newSets
      .filter(set => set.enabled)
      .flatMap(set => set.images)
      .filter(img => img.enabled)
      .map(img => img.url)
      .filter(Boolean);
    onChange(enabledImages);
  };

  const handleAddSet = () => {
    if (newSetName.trim()) {
      const newSet = {
        id: Date.now().toString(),
        name: newSetName.trim(),
        enabled: true,
        images: []
      };
      const updatedSets = [...sets, newSet];
      onSetsChange(updatedSets);
      setNewSetName('');
      setShowNewSetInput(false);
      // Expand the newly added set
      setExpandedSets(prev => ({ ...prev, [newSet.id]: true }));
    }
  };

  const handleRemoveSet = (setId) => {
    onSetsChange(sets.filter(s => s.id !== setId));
    // Remove the expanded state for the removed set
    setExpandedSets(prev => {
      const { [setId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleToggleSet = (setId) => {
    const newSets = sets.map(set => {
      if (set.id === setId) {
        return {
          ...set,
          enabled: !set.enabled
        };
      }
      return set;
    });
    onSetsChange(newSets);
    
    // Update active images based on enabled sets and images
    const enabledImages = newSets
      .filter(set => set.enabled)
      .flatMap(set => set.images)
      .filter(img => img.enabled)
      .map(img => img.url)
      .filter(Boolean);
    onChange(enabledImages);
  };

  const toggleSetExpansion = (setId) => {
    setExpandedSets(prev => ({
      ...prev,
      [setId]: !prev[setId]
    }));
  };

  return (
    <div className="bg-manager">
      <div className="bg-manager-header">
        <h3>Background Images</h3>
        <button className="bg-manager-add-set-button" onClick={() => setShowNewSetInput(true)}>
          + Set
        </button>
      </div>
      
      <div className="bg-manager-sets">
        {showNewSetInput && (
          <div className="bg-manager-new-set-input">
            <input
              type="text"
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              placeholder="Enter set name..."
              className="bg-manager-set-name-input"
            />
            <button onClick={handleAddSet} disabled={!newSetName.trim()}>
              Add
            </button>
            <button onClick={() => {
              setShowNewSetInput(false);
              setNewSetName('');
            }}>
              Cancel
            </button>
          </div>
        )}

        {/* Image Sets */}
        {sets.map(set => (
          <div key={set.id} className="bg-manager-set">
            <div className="bg-manager-set-header" onClick={() => toggleSetExpansion(set.id)}>
              <div className="bg-manager-set-info">
                <label className="bg-manager-set-toggle">
                  <input
                    type="checkbox"
                    checked={set.enabled}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleSet(set.id);
                    }}
                    className="toggle-switch"
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="bg-manager-set-name">{set.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSet(set.id);
                  }}
                  className="bg-manager-remove-set-button"
                  title="Remove set"
                >
                  ×
                </button>
                <span className={`expand-icon ${expandedSets[set.id] ? 'expanded' : ''}`}>▼</span>
              </div>
            </div>
            {expandedSets[set.id] && (
              <div className="bg-manager-images-list">
                {set.images.map((img, index) => (
                  <div key={index} className="bg-manager-image-item">
                    <label className="bg-manager-image-toggle">
                      <input
                        type="checkbox"
                        checked={img.enabled}
                        onChange={() => handleToggleImage(set.id, index)}
                        className="toggle-switch"
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <input
                      type="text"
                      value={img.url}
                      onChange={(e) => handleUpdateImage(set.id, index, e.target.value)}
                      placeholder="Enter image URL..."
                      className="bg-manager-image-url-input"
                    />
                    {img.url && (
                      <button
                        className="bg-manager-preview-button"
                        onMouseEnter={(e) => handleMouseEnter(img.url, e)}
                        onMouseLeave={handleMouseLeave}
                        title="Preview image"
                      >
                        👁
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveImage(set.id, index)}
                      className="bg-manager-remove-image-button"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddImage(set.id)}
                  className="bg-manager-add-image-button"
                >
                  Add Image
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {previewUrl && (
        <div 
          className="bg-manager-image-preview"
          style={{
            top: previewPosition.y,
            left: previewPosition.x
          }}
        >
          <img src={previewUrl} alt="Preview" />
        </div>
      )}
    </div>
  );
};

export default BackgroundManager;
