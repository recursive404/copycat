import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faWindowMinimize, faWindowMaximize, faXmark, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { getCurrentWindow, minimize, maximize, unmaximize, close } from '@electron/remote';
import './../styles/titlebar.css';

const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const win = getCurrentWindow();

  const handleMinimize = () => {
    minimize();
  };

  const handleMaximize = () => {
    if (win.isMaximized()) {
      unmaximize();
      setIsMaximized(false);
    } else {
      maximize();
      setIsMaximized(true);
    }
  };

  const handleClose = () => {
    close();
  };

  return (
    <div className="title-bar" onDoubleClick={handleMaximize}>
      <div className="title-bar-drag-area">
        <div className="title-bar-brand">copycat</div>
      </div>
      <div className="title-bar-controls">
        <button className="title-bar-button" onClick={handleMinimize}>
          <FontAwesomeIcon icon={faWindowMinimize} />
        </button>
        <button className="title-bar-button" onClick={handleMaximize}>
          <FontAwesomeIcon icon={isMaximized ? faWindowRestore : faWindowMaximize} />
        </button>
        <button className="title-bar-button close" onClick={handleClose}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
        <button className="title-bar-button settings">
          <FontAwesomeIcon icon={faCog} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
