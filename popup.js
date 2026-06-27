const statusEl = document.getElementById('status');
const titleEl = document.getElementById('title');
const readTimeEl = document.getElementById('readTime');
const summaryListEl = document.getElementById('summaryList');
const keywordsEl = document.getElementById('keywords');
const refreshBtn = document.getElementById('refreshBtn');
const copyBtn = document.getElementById('copyBtn');

function updateUI(data) {
  if (!data) {
    statusEl.textContent = 'No page content found.';
    return;
  }

  titleEl.textContent = data.title || 'Untitled page';
  readTimeEl.textContent = `${data.readTime} min`;
  summaryListEl.innerHTML = data.summary
    .map((item) => `<li>${item}</li>`)
    .join('');
  keywordsEl.innerHTML = data.keywords
    .map((word) => `<span class="keyword">${word}</span>`)
    .join('');
  statusEl.textContent = 'Analysis complete.';
}

function analyzePage() {
  statusEl.textContent = 'Analyzing…';
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) {
      statusEl.textContent = 'Unable to access this tab.';
      return;
    }

    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }, () => {
      chrome.tabs.sendMessage(tab.id, { action: 'analyze' }, (response) => {
        if (chrome.runtime.lastError) {
          statusEl.textContent = 'Could not analyze this page.';
          return;
        }
        updateUI(response);
      });
    });
  });
}

copyBtn.addEventListener('click', async () => {
  const text = summaryListEl.innerText || '';
  if (!text) return;
  await navigator.clipboard.writeText(text.replace(/\s+/g, ' ').trim());
  statusEl.textContent = 'Summary copied.';
});

refreshBtn.addEventListener('click', analyzePage);
document.addEventListener('DOMContentLoaded', analyzePage);
