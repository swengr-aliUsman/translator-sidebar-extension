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

function scheduleSelectionSync() {
  window.setTimeout(sendSelectionToSidebar, 50);
}

document.addEventListener('mouseup', scheduleSelectionSync);
document.addEventListener('keyup', scheduleSelectionSync);
document.addEventListener('selectionchange', scheduleSelectionSync);
document.addEventListener('touchend', scheduleSelectionSync);
