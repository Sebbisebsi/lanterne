// When the extension icon is clicked, open a new tab (which shows Lanterne)
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'chrome://newtab' });
});
