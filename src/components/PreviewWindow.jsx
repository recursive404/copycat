import React from 'react';

const PreviewWindow = ({ content }) => {
  return (
    <div className="preview-window" style={{
      backgroundColor: 'var(--secondary-bg)',
      borderRadius: '8px',
      border: '1px solid var(--border-color)'
    }}>
      <div className="preview-header">
        <h2>Preview</h2>
      </div>
      <div className="preview-content">
        <pre>{content}</pre>
      </div>
    </div>
  );
};

export default PreviewWindow;
