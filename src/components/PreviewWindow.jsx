import React from 'react';

const PreviewWindow = ({ content }) => {
  return (
    <div className="preview-window">
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
