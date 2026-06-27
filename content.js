let lastSentSelection = '';

function getSelectionText() {
  const selection = window.getSelection();
  return selection?.toString()?.trim() || '';
}

function sendSelectionToSidebar() {
  const selectedText = getSelectionText();
  if (!selectedText) {
    lastSentSelection = '';
    return;
  }

  if (selectedText === lastSentSelection) return;

  lastSentSelection = selectedText;
  chrome.runtime.sendMessage({
    action: 'translate-selection',
    text: selectedText
  });
}

document.addEventListener('mouseup', sendSelectionToSidebar);
document.addEventListener('keyup', sendSelectionToSidebar);
document.addEventListener('selectionchange', sendSelectionToSidebar);
