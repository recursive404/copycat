const { ipcRenderer } = window.require('electron');

// Save files to localStorage
export const saveFiles = (files) => {
  try {
    const serializedFiles = JSON.stringify(files.map(file => ({
      path: file.path,
      name: file.name
    })));
    localStorage.setItem('selectedFiles', serializedFiles);
  } catch (error) {
    console.error('Error saving files:', error);
  }
};

// Load files from localStorage
export const loadFiles = async () => {
  try {
    const serializedFiles = localStorage.getItem('selectedFiles');
    if (!serializedFiles) return [];
    
    const files = JSON.parse(serializedFiles);
    
    // Re-fetch content for each file to ensure it's fresh
    const refreshedFiles = await Promise.all(
      files.map(async (file) => {
        try {
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
