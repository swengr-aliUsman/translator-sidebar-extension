async function translateText(text, targetLang = 'en') {
  const normalized = (text || '').trim();
  if (!normalized) {
    return { ok: true, sourceText: '', translation: '', detectedLang: 'unknown' };
  }

  const encodedText = encodeURIComponent(normalized.slice(0, 1500));
  const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=auto|${targetLang}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Translation request failed with ${response.status}`);
  }

  const data = await response.json();
  const translatedText = data?.responseData?.translatedText || data?.matches?.[0]?.translation || normalized;
  const detectedLang = data?.responseData?.match?.[0]?.language || 'unknown';

  return {
    ok: true,
    sourceText: normalized,
    translation: translatedText,
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
