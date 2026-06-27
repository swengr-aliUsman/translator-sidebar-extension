const sourceTextEl = document.getElementById('sourceText');
const translationEl = document.getElementById('translation');
const targetLangEl = document.getElementById('targetLang');
const manualTextEl = document.getElementById('manualText');
const translateBtn = document.getElementById('translateBtn');
const statusEl = document.getElementById('status');

function setStatus(message) {
  statusEl.textContent = message;
}

function updateResult(sourceText, translation) {
  sourceTextEl.textContent = sourceText || 'Nothing selected yet.';
  translationEl.textContent = translation || 'The translation will appear here.';
}

async function translateText(text) {
  if (!text?.trim()) {
    updateResult('', '');
    setStatus('Select text or enter some text to translate.');
    return;
  }

  setStatus('Translating…');
  const response = await chrome.runtime.sendMessage({
    action: 'translate-selection',
    text: text.trim(),
    targetLang: targetLangEl.value
  });

  if (response?.ok) {
    updateResult(response.sourceText, response.translation);
    setStatus(`Translated to ${targetLangEl.value.toUpperCase()}`);
  } else {
    updateResult(text.trim(), 'Translation failed.');
    setStatus(response?.error || 'Translation failed.');
  }
}

translateBtn.addEventListener('click', () => translateText(manualTextEl.value));

targetLangEl.addEventListener('change', () => {
  chrome.storage.session.set({ targetLanguage: targetLangEl.value });
  if (manualTextEl.value.trim()) {
    translateText(manualTextEl.value);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.action === 'selection-translated') {
    updateResult(message.sourceText, message.translation);
    setStatus(`Translated to ${message.targetLang?.toUpperCase() || 'EN'}`);
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'session') return;
  if (changes.lastSelection || changes.lastTranslation) {
    const sourceText = changes.lastSelection?.newValue || '';
    const translation = changes.lastTranslation?.newValue || '';
    updateResult(sourceText, translation);
    if (sourceText && translation) {
      setStatus('Updated from your latest selection.');
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.session.get(['targetLanguage', 'lastSelection', 'lastTranslation'], (result) => {
    targetLangEl.value = result.targetLanguage || 'en';
    if (result.lastSelection || result.lastTranslation) {
      updateResult(result.lastSelection || '', result.lastTranslation || '');
      setStatus('Loaded your last translation.');
    } else {
      setStatus('Waiting for selection…');
    }
  });

  chrome.runtime.sendMessage({ action: 'get-selection-state' }, (result) => {
    if (result?.lastSelection || result?.lastTranslation) {
      updateResult(result.lastSelection || '', result.lastTranslation || '');
    }
  });
});
