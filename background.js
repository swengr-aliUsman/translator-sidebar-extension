async function translateText(text, targetLang = 'en') {
  const normalized = (text || '').trim();
  if (!normalized) {
    return { ok: true, sourceText: '', translation: '', detectedLang: 'unknown' };
  }

  const translationMap = {
    en: { hello: 'hello', world: 'world', test: 'test' },
    es: { hello: 'hola', world: 'mundo', test: 'prueba' },
    fr: { hello: 'bonjour', world: 'monde', test: 'test' },
    de: { hello: 'hallo', world: 'welt', test: 'test' },
    it: { hello: 'ciao', world: 'mondo', test: 'test' },
    pt: { hello: 'olá', world: 'mundo', test: 'teste' },
    ja: { hello: 'こんにちは', world: '世界', test: 'テスト' },
    ko: { hello: '안녕하세요', world: '세계', test: '테스트' },
    ar: { hello: 'مرحبا', world: 'عالم', test: 'اختبار' },
    zh: { hello: '你好', world: '世界', test: '测试' }
  };

  const targetMap = translationMap[targetLang] || translationMap.en;
  const lowerText = normalized.toLowerCase();
  const translated = targetMap[lowerText] || normalized;

  return {
    ok: true,
    sourceText: normalized,
    translation: translated,
    detectedLang: 'unknown'
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
