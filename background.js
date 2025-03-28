let openedNewWindow = false

chrome.tabs.onCreated.addListener((tab) => {
  console.log("Intercepted", tab, openedNewWindow)
  const url = tab.pendingUrl ?? tab.url;

  if (!url) {
    console.log("No url")
    return;
  }
  if (url.startsWith("chrome://newtab")) {
    console.log("chrome://newtab")
    return;
  }
  if (openedNewWindow) {
    console.log("Just opened the tab, ignoring")
    openedNewWindow = false;
    return;
  }

  openedNewWindow = true;
  console.log("Opening", url)
  chrome.windows.create({ url }, () => {
    console.log("Opened", url)
    chrome.tabs.remove(tab.id); // Close the original tab
  });
});
