import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faWindowMinimize, faWindowMaximize, faXmark } from '@fortawesome/free-solid-svg-icons';
import { remote } from '@electron/remote';
import './../styles/titlebar.css';

const TitleBar = () => {
  const handleMinimize = () => {
    remote.getCurrentWindow().minimize();
  };

  const handleMaximize = () => {
    const win = remote.getCurrentWindow();
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  };

  const handleClose = () => {
    remote.getCurrentWindow().close();
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
          <FontAwesomeIcon icon={faWindowMaximize} />
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
