//IIFI
(() => {
  const Constants = {
    ApiRoot: '../../api/v1/'
  };

  const getAsciiValue = data => {
    let result = 0;

    data.split('').forEach(element => {
        result += element.charCodeAt(0);
    });

    return result;
  }

  const HideMessage = () => $('.error-container').addClass('d-none');

  const ShowMessage = (msg, autoHideAfter = 0, isError = true) => {
    const $error = $('.error-container');

    if($error.length === 0) {
      alert(msg);
      return;
    }

    const $alert = $error.find('.alert');
    $alert.html(msg);
    $alert.removeClass('alert-danger').removeClass('alert-success').addClass(`alert-${isError ? 'danger' : 'success'}`);
    $error.removeClass('d-none');

    if (autoHideAfter > 0) {
      setTimeout(() => {
        $error.addClass('d-none');
      }, autoHideAfter);
    }
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
          <tr class='row-term-footer'>
            <td colspan='4'>
              <button type="button" class="btn btn-primary btn-generate-urls">Generate URLs</button>  
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    `;

    $('.terms-list').html($html);
  };

  $(document).ready(() => {
    const $baseURL = $('#baseURL');
    const $rowTerms = $('.row-terms');

    $baseURL.on('change', evt => {
      HideMessage();
      $rowTerms.hide();
    });

    $('.btn-get-terms').on('click', evt => {
      HideMessage();
      
      const $urlParts = $baseURL.val().replace('http://', '').replace('https://', '').split('/');
      const termsPart = $urlParts.pop();
      if (!termsPart || $urlParts.length === 0) {
        ShowMessage(`Invalid URL Format.`);
        return;
      };

      $rowTerms.show();
      const domainName = $baseURL.val().replace(termsPart, '');
      const url = `${Constants.ApiRoot}${termsPart}`;

      $.get(url).then(data => displayTerms(data, domainName));
    });

    $(document).on('click', '.btn-generate-urls', event => {
      HideMessage();
      const $this = $(eval('this'));
      ConsoleLog($this);
    });
    
    $(document).on('change', '.text-term', event => {
      const $this = $(eval('this'));
      ConsoleLog($this.data());
    });
  });
  
  ConsoleLog(`URL Generator Browser Script..... >>`);
})();