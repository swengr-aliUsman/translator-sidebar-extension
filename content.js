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

function getMainText() {
  const selectors = ['article', 'main', '[role="main"]', 'section'];
  let root = null;

  for (const selector of selectors) {
    root = document.querySelector(selector);
    if (root) break;
  }

  const container = root || document.body;
  const text = Array.from(container.querySelectorAll('p, li, h1, h2, h3'))
    .map((el) => el.textContent?.trim())
    .filter(Boolean)
    .join(' ');

  return text || (document.body?.innerText || '').trim();
}

function cleanText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function createSummary(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.slice(0, 3).map((s) => s.trim()).filter(Boolean);
}

function extractKeywords(text) {
  const stopWords = new Set([
    'the','and','for','that','with','this','have','from','your','about','into','their','them','you','are','but','not','was','were','will','can','our','all','one','what','when','how','use','using','page','site','web','http','https','developer','developers','very','more','than','then','also','just','into','over','after','before','during','without','within'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  const counts = {};
  words.forEach((word) => {
    counts[word] = (counts[word] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyze') {
    const fullText = cleanText(getMainText());
    const summary = createSummary(fullText);
    const keywords = extractKeywords(fullText);
    const words = fullText.split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(words / 200));

    sendResponse({
      title: document.title || 'Untitled page',
      readTime,
      summary: summary.length ? summary : ['No clear summary available for this page.'],
      keywords: keywords.length ? keywords : ['general']
    });
    return true;
  }

  return true;
});
