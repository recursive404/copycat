const { ipcRenderer } = window.require('electron');

// Save files to localStorage
export const saveFiles = (files) => {
  try {
    // Ensure we only save unique files by path
    const uniqueFiles = Array.from(
      new Map(files.map(file => [file.path, file])).values()
    );
    
    const serializedFiles = JSON.stringify(uniqueFiles.map(file => ({
      path: file.path,
      name: file.name,
      content: file.content
    })));
    localStorage.setItem('selectedFiles', serializedFiles);
    return true;
  } catch (error) {
    console.error('Error saving files:', error);
    return false;
  }
};

// Load files from localStorage
export const loadFiles = async (forceRefresh = false) => {
  try {
    const serializedFiles = localStorage.getItem('selectedFiles');
    if (!serializedFiles) return [];
    
    const files = JSON.parse(serializedFiles);
    
    const refreshedFiles = await Promise.all(
      files.map(async (file) => {
        try {
          // Only fetch from disk if forcing refresh or no content exists
          if (forceRefresh || !file.content) {
            const content = await ipcRenderer.invoke('read-file', file.path);
            return { ...file, content };
          }
          return file;
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
