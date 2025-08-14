

export const initializeSecurity = () => {

  document.addEventListener("contextmenu", (event) => event.preventDefault());

  
  document.addEventListener('keydown', (event) => {
    if (
      event.key === "F5" ||                                      // Refresh 
      event.key === "F12" ||                                     // DevTools
      (event.ctrlKey && event.key === "u") ||                    // View Source 
      (event.ctrlKey && event.key === "f") ||                    // Find idk why i did this
      (event.ctrlKey && event.key === "p") ||                    // Print idk why i did this
      (event.ctrlKey && event.key === "s") ||                    // Save idk why i did this
      (event.ctrlKey && event.key === "i") ||                    // DevTools shortcut
      (event.ctrlKey && event.shiftKey && event.key === "C") ||  // DevTools Console
      (event.ctrlKey && event.shiftKey && event.key === "J") ||  // DevTools Sources
      (event.ctrlKey && event.shiftKey && event.key === "I") ||  // DevTools Inspector
      (event.metaKey && ["f", "p", "u", "s", "i"].includes(event.key))
    ) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });


  ["dragstart", "drop", "copy", "cut", "paste"].forEach(evt =>
    document.addEventListener(evt, (e) => e.preventDefault())
  );

  document.addEventListener('selectstart', (e) => e.preventDefault());


  let devToolsOpen = false;
  const detectDevTools = () => {
    if (
      window.outerWidth - window.innerWidth > 160 || 
      window.outerHeight - window.innerHeight > 160
    ) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        console.clear();
        console.log("DevTools detected");
      }
    } else {
      devToolsOpen = false;
    }
  };

  setInterval(detectDevTools, 1000);


  const protectConsole = () => {
    const noop = () => {};
    const consoleProtection = {
      log: noop,
      warn: noop,
      error: noop,
      info: noop,
      debug: noop,
      clear: noop,
      table: noop,
      trace: noop,
      group: noop,
      groupEnd: noop,
      time: noop,
      timeEnd: noop,
      count: noop,
      assert: noop
    };

    if (process.env.NODE_ENV === 'production') {
      Object.assign(console, consoleProtection);
    }
  };

  protectConsole();

  const disableAutocomplete = () => {
    document.querySelectorAll("input, textarea").forEach(element => {
      element.setAttribute("autocomplete", "off");
      element.setAttribute("spellcheck", "false");
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', disableAutocomplete);
  } else {
    disableAutocomplete();
  }
  const observer = new MutationObserver(() => {
    disableAutocomplete();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log("Security measures initialized");
};

export const clearSensitiveData = () => {

  localStorage.clear();
  

  sessionStorage.clear();
  
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
};

export const obfuscateText = (text: string): string => {
  return text.replace(/./g, '*');
};
