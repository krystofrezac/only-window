let openedNewWindow = false

const closeStartPages = ()=>{
  chrome.tabs.query({}, allPages => {
    if (allPages.length > 1) {
      const startPages = allPages.filter(page => page.url.startsWith("chrome://vivaldi-webui/startpage"))
      console.log("Closed", startPages)
      chrome.tabs.remove(startPages.map(startPage => startPage.id))
    }
  })
}

chrome.tabs.onCreated.addListener((tab) => {
  console.log("Intercepted", tab, openedNewWindow)

  closeStartPages()

  const url = tab.pendingUrl ?? tab.url;

  if (openedNewWindow) {
    console.log("Just opened the tab, ignoring")
    openedNewWindow = false;
    return;
  }

  if (!url) {
    console.log("No url, creating window and moving the tab there")
    chrome.windows.create({ incognito: tab.incognito }, (window)=>{
      console.log("Created window")
      chrome.tabs.move(tab.id, {windowId: window.id, index: 0})

      closeStartPages()
      // Without this, `_blank` pages are covered by start page
      setTimeout(()=>{
        closeStartPages()
      }, 500)
    })
    return;
  }
  if (url.startsWith("chrome://newtab")) {
    console.log("chrome://newtab")
    return;
  }

  openedNewWindow = true;
  console.log("Opening", url)
  chrome.windows.create({ url, incognito: tab.incognito }, () => {
    console.log("Opened", url)
    chrome.tabs.remove(tab.id); // Close the original tab
  });
});
