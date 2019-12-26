//IIFI
(() => {
  const ConsoleLog = (msg, _error = false) => {
    if (_error) {
      console.error(msg);
    } else {
      console.log(msg);
    }
  };
  
  ConsoleLog(`URL Generator Browser Script..... >>`);
})();