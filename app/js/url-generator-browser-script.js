//IIFI
(() => {
  const getAsciiValue = data => {
    let result = 0;

    data.split('').forEach(element => {
        result += element.charCodeAt(0);
    });

    return result;
  }

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

  const displayTerms = (data, domainName) => {
    ConsoleLog(data);
    let $html = '';
    
    $html = domainName;
    
    data.terms.forEach(element => {
      $html += `<span class='alpha-${element.isAlpha}'>${element.term}</span>`;
    });

    $('.terms-url').html($html);

    $html = `
    <div class="table-responsive">
      <table class="table">
        <thead>
        <tr>
          <th>Alphabetical</th>
          <th></th>
          <th>Range Start</th>
          <th>Range End</th>
        </tr>
        </thead>
        <tbody>
    `;

    data.terms.forEach(element => {
      $html += `
      <tr class='row-term' data-index='${element.index}'>
        <td>
          <input type='checkbox' disabled='disabled' ${element.isAlpha ?  'checked' : ''} />
        </td>
        <td><span class='alpha-${element.isAlpha}'>${element.term}</span></td>
        <td>
          <input type='text' class='text-term text-term-start' value='${element.term}' data-term='${element.term}' data-is-alpha='${element.isAlpha}' data-index='${element.index}' />
        </td>
        <td>
          <input type='text' class='text-term text-term-end' value='' data-term='${element.term}' data-is-alpha='${element.isAlpha}' data-index='${element.index}' />
        </td>
      </tr>
      `;
    });

    $html += `
        </tbody>
      </table>
    </div>
    `;

    $('.terms-list').html($html);
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

      const domainName = $baseURL.replace(termsPart, '');
      var $apiRoot  = '../../api/v1/'

      $.get(`${$apiRoot}${termsPart}`).then(data => displayTerms(data, domainName));

      $(document).on('change', '.text-term', event => {
        const that = $(eval('this'));
        ConsoleLog(that.data());
      });
    });
  });
  
  ConsoleLog(`URL Generator Browser Script..... >>`);
})();