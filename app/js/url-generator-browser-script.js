//IIFI
(() => {
  const ShowMessage = msg => {
    alert(msg);
  };
  const ConsoleLog = (msg, _error = false) => {
    if (_error) {
      console.error(msg);
    } else {
      console.log(msg);
    }
  };

  $(document).ready(() => {
    $('.btn-get-terms').on('click', evt => {
      const $baseURL = $('#baseURL').val();
      
      const $urlParts = $baseURL.replace('http://', '').replace('https://', '').split('/');
      const termsPart = $urlParts.pop();

      if (!termsPart || $urlParts.length === 0) {
        ShowMessage(`Invalid URL Format.`);
        return;
      };

      var $apiRoot  = '../../api/v1/'

      $.get(`${$apiRoot}${termsPart}`).then(data => {
        ConsoleLog(data);
      });
    });
  });
  
  ConsoleLog(`URL Generator Browser Script..... >>`);
})();