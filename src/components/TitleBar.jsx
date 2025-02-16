import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faWindowMinimize, faWindowMaximize, faXmark, faWindowRestore, faDice } from '@fortawesome/free-solid-svg-icons';
const { getCurrentWindow } = window.require('@electron/remote');
import './../styles/titlebar.css';

const TitleBar = ({ slideshowEnabled, slideshowMode, onRandomize }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const win = getCurrentWindow();

  const handleMinimize = () => {
    win.minimize();
  };

  const handleMaximize = () => {
    if (win.isMaximized()) {
      win.unmaximize();
      setIsMaximized(false);
    } else {
      win.maximize();
      setIsMaximized(true);
    }
  };

  const handleClose = () => {
    win.close();
  };

  return (
    <div className="title-bar" onDoubleClick={handleMaximize}>
      <div className="title-bar-drag-area">
        <div className="title-bar-brand">copycat</div>
      </div>
      <div className="title-bar-controls">
        {slideshowEnabled && (slideshowMode === 'random' || slideshowMode === 'random-no-repeat') && (
          <button className="title-bar-button" onClick={onRandomize} title="Randomize Background">
            <FontAwesomeIcon icon={faDice} />
          </button>
        )}
        <button className="title-bar-button settings" onClick={() => window.dispatchEvent(new Event('toggle-settings'))}>
          <FontAwesomeIcon icon={faCog} />
        </button>
        <button className="title-bar-button" onClick={handleMinimize}>
          <FontAwesomeIcon icon={faWindowMinimize} />
        </button>
        <button className="title-bar-button" onClick={handleMaximize}>
          <FontAwesomeIcon icon={isMaximized ? faWindowRestore : faWindowMaximize} />
        </button>
        <button className="title-bar-button close" onClick={handleClose}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
