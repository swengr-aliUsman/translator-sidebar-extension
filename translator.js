const translationMap = {
  en: {
    hello: 'hello',
    world: 'world',
    test: 'test',
    hi: 'hi',
    how: 'how',
    are: 'are',
    you: 'you',
    today: 'today'
  },
  es: {
    hello: 'hola',
    world: 'mundo',
    test: 'prueba',
    hi: 'hola',
    how: 'cómo',
    are: 'estás',
    you: 'tú',
    today: 'hoy'
  },
  fr: {
    hello: 'bonjour',
    world: 'monde',
    test: 'test',
    hi: 'salut',
    how: 'comment',
    are: 'allez',
    you: 'vous',
    today: 'aujourd\'hui'
  },
  de: {
    hello: 'hallo',
    world: 'welt',
    test: 'test',
    hi: 'hallo',
    how: 'wie',
    are: 'sind',
    you: 'Sie',
    today: 'heute'
  },
  it: {
    hello: 'ciao',
    world: 'mondo',
    test: 'test',
    hi: 'ciao',
    how: 'come',
    are: 'stai',
    you: 'tu',
    today: 'oggi'
  },
  pt: {
    hello: 'olá',
    world: 'mundo',
    test: 'teste',
    hi: 'oi',
    how: 'como',
    are: 'está',
    you: 'você',
    today: 'hoje'
  },
  ja: {
    hello: 'こんにちは',
    world: '世界',
    test: 'テスト',
    hi: 'こんにちは',
    how: 'どう',
    are: 'です',
    you: 'あなた',
    today: '今日'
  },
  ko: {
    hello: '안녕하세요',
    world: '세계',
    test: '테스트',
    hi: '안녕',
    how: '어떻게',
    are: '지내',
    you: '너',
    today: '오늘'
  },
  ar: {
    hello: 'مرحبا',
    world: 'عالم',
    test: 'اختبار',
    hi: 'مرحبا',
    how: 'كيف',
    are: 'أنت',
    you: 'أنت',
    today: 'اليوم'
  },
  zh: {
    hello: '你好',
    world: '世界',
    test: '测试',
    hi: '你好',
    how: '怎么',
    are: '是',
    you: '你',
    today: '今天'
  }
};

export function translateText(text, targetLang = 'en') {
  const normalized = (text || '').trim();
  if (!normalized) {
    return { ok: true, sourceText: '', translation: '', detectedLang: 'unknown' };
  }

  const targetMap = translationMap[targetLang] || translationMap.en;
  const words = normalized.toLowerCase().split(/(\s+)/).filter(Boolean);
  const translatedWords = words.map((word) => {
    if (/\s+/.test(word)) {
      return word;
    }

    return targetMap[word] || word;
  });

  const translated = translatedWords.join('');
  const changed = translated !== normalized;

  return {
    ok: true,
    sourceText: normalized,
    translation: changed ? translated : `Translation unavailable for "${normalized}"`,
    detectedLang: 'unknown'
  };
}
