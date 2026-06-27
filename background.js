async function translateText(text, targetLang = 'en') {
  const normalized = (text || '').trim();
  if (!normalized) {
    return { ok: true, sourceText: '', translation: '', detectedLang: 'unknown' };
  }

  const endpoint = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(normalized)}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Translation API error: ${response.status}`);
  }

  const data = await response.json();
  const detectedLang = Array.isArray(data) && data[2] ? data[2] : 'unknown';
  const translation = Array.isArray(data) && Array.isArray(data[0])
    ? data[0].map((segment) => segment[0]).join('')
    : normalized;

  return {
    ok: true,
    sourceText: normalized,
    translation,
    detectedLang
  };
}

function notifySidebar(payload) {
  chrome.storage.session.set({
    lastSelection: payload.sourceText || '',
    lastTranslation: payload.translation || '',
    targetLanguage: payload.targetLang || 'en'
  });

  chrome.runtime.sendMessage(payload, () => {
    if (chrome.runtime.lastError) {
      console.warn('Sidebar message failed:', chrome.runtime.lastError.message);
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({
    enabled: true,
    path: 'sidebar.html',
    tabId: undefined
  });
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.action.onClicked.addListener((tab) => {
  if (!tab?.id) return;
  chrome.sidePanel.setOptions({
    enabled: true,
    path: 'sidebar.html',
    tabId: tab.id
  });
  chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action === 'translate-selection') {
    chrome.storage.session.get(['targetLanguage'], async (result) => {
      try {
        const targetLang = message.targetLang || result.targetLanguage || 'en';
        const payload = await translateText(message.text, targetLang);
        notifySidebar({
          action: 'selection-translated',
          sourceText: payload.sourceText,
          translation: payload.translation,
          detectedLang: payload.detectedLang,
          targetLang
        });
        sendResponse(payload);
      } catch (error) {
        sendResponse({ ok: false, error: error.message });
      }
    });
    return true;
  }

  if (message?.action === 'get-selection-state') {
    chrome.storage.session.get(['lastSelection', 'lastTranslation', 'targetLanguage'], (result) => {
      sendResponse(result);
    });
    return true;
  }

  return true;
});
