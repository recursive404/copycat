const { ipcRenderer } = window.require('electron');

// Save files to localStorage
export const saveFiles = (files) => {
  try {
    const serializedFiles = JSON.stringify(files.map(file => ({
      path: file.path,
      name: file.name,
      content: file.content // Also save content to avoid unnecessary re-reads
    })));
    localStorage.setItem('selectedFiles', serializedFiles);
    return true;
  } catch (error) {
    console.error('Error saving files:', error);
    return false;
  }
};

// Load files from localStorage
export const loadFiles = async () => {
  try {
    const serializedFiles = localStorage.getItem('selectedFiles');
    if (!serializedFiles) return [];
    
    const files = JSON.parse(serializedFiles);
    
    // Only re-fetch content if it's not already in the saved data
    const refreshedFiles = await Promise.all(
      files.map(async (file) => {
        try {
          // If we have content saved, use it
          if (file.content) {
            return file;
          }
          // Otherwise fetch fresh content
          const content = await ipcRenderer.invoke('read-file', file.path);
          return { ...file, content };
        } catch (error) {
          console.error(`Error loading file ${file.path}:`, error);
          return null;
        }
      })
    );

    // Filter out any files that failed to load
    return refreshedFiles.filter(file => file !== null);
  } catch (error) {
    console.error('Error loading files:', error);
    return [];
  }
};
