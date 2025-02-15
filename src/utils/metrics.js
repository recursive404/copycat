// Rough estimation of GPT tokens (not exact but good enough for estimation)
export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function countLines(text) {
  return text.split('\n').length;
}
