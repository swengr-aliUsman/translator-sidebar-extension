function getSelectionText() {
  const selection = window.getSelection();
  return selection?.toString()?.trim() || '';
}

function sendSelectionToSidebar() {
  const selectedText = getSelectionText();
  if (!selectedText) return;

  chrome.runtime.sendMessage({
    action: 'translate-selection',
    text: selectedText
  });
}

document.addEventListener('mouseup', () => {
  const selectedText = getSelectionText();
  if (!selectedText) return;

  setTimeout(() => {
    if (getSelectionText() === selectedText) {
      sendSelectionToSidebar();
    }
  }, 80);
});
