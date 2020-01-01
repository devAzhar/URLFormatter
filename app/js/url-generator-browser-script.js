//IIFI
(() => {
  const Constants = {
    ApiRoot: '../../api/v1/',
    GenerateApi: 'execute',
    ShowLinks: true,
    MaxTerms: 1000
  };

  const getAsciiValue = data => {
    let result = 0;

    data.split('').forEach(element => {
        result += element.charCodeAt(0);
    });

    ConsoleLog(`Ascii(${data})=${result}`);

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
        <td><span class='term alpha-${element.isAlpha}'>${element.term}</span></td>
        <td>
          <input max-length='5' type='text' class='form-control text-term text-term-start' value='${element.term}' data-term='${element.term}' data-is-alpha='${element.isAlpha}' data-index='${element.index}' />
        </td>
        <td>
          <input max-length='5' type='text' class='form-control text-term text-term-end' value='' data-term='${element.term}' data-is-alpha='${element.isAlpha}' data-index='${element.index}' />
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

  const isNumbers = input => {
    var letters = /^[0-9]+$/;
    return !(input.match(letters) === null);
  };
  const isAlphaString = input => {
    var letters = /^[A-Za-z]+$/;
    return !(input.match(letters) === null);
  };

  const validateTermPattern = (termStart, termEnd) => {
    
    if(!termEnd) {
      return true;
    }

    if(termStart.length !== termEnd.length) {
      return false;
    }

    let result = true;

    termStart.split('').forEach((term, index) => {
      var letters = /^[A-Z]+$/;

      if(term.match(letters) !== null && termEnd[index].match(letters) === null) {
        result = false;
      }

      letters = /^[a-z]+$/;

      if(term.match(letters) !== null && termEnd[index].match(letters) === null) {
        result = false;
      }
    });

    return result;
  };

  const validateTermRanges = () => {
    const response = {success: true, message: ''};
    const $termsRows = $('.terms-list .row-term');
    let $error = '';

    $termsRows.each(($index, $row) => {
      $row = $($row);
      const $termStart = $row.find('.text-term-start').val().trim();
      const $termEnd = $row.find('.text-term-end').val().trim();
      const $term = $row.find('.term').html().trim();
      const $isAlpha = $row.find('.term').hasClass('alpha-true');

      if(!$termStart) {
        $error += `<i>${$term}</i>: Range Start cannot be empty.<br />`;
      }
      else if ($termEnd && $termStart.length !== $termEnd.length) {
        $error += `<i>${$term}</i>: Range End is invalid.<br />`;
      }
      else if ($termEnd && $termStart.length !== $termEnd.length) {
        $error += `<i>${$term}</i>: Range End is invalid.<br />`;
      }
      else if (!$isAlpha && !isNumbers($termStart)) {
        $error += `<i>${$term}</i>: Range Start should be numeric.<br />`;
      }
      else if ($termEnd && !$isAlpha && !isNumbers($termEnd)) {
        $error += `<i>${$term}</i>: Range End should be numeric.<br />`;
      }
      else if ($isAlpha && !isAlphaString($termStart)) {
        $error += `<i>${$term}</i>: Range Start should only contain alphabets.<br />`;
      }
      else if ($termEnd && $isAlpha && !isAlphaString($termEnd)) {
        $error += `<i>${$term}</i>: Range End should only contain alphabets.<br />`;
      }
      else if ($termEnd && getAsciiValue($termStart) > getAsciiValue($termEnd)) {
        $error += `<i>${$term}</i>: Range Start cannot be greater than the Range End.<br />`;
      }
      else if ($termEnd && $isAlpha && !validateTermPattern($termStart, $termEnd)) {
        $error += `<i>${$term}</i>: Range End should follow the same pattern as Range Start.<br />`;
      }
    });

    if ($error) {
      response.success = false;
      response.message = $error;
    }

    return response;
  };

  const getTermRangesJSON = () => {
    const json = new Array();

    const $termsRows = $('.terms-list .row-term');

    $termsRows.each((index, $row) => {
      $row = $($row);
      const rangeStart = $row.find('.text-term-start').val().trim();
      const rangeEnd = $row.find('.text-term-end').val().trim() || rangeStart;
      const term = $row.find('.term').html().trim();
      const isAlpha = $row.find('.term').hasClass('alpha-true');
      const isNumber = !isAlpha;

      const $termJSON = {index, term, rangeStart, rangeEnd, isAlpha, isNumber};
      json.push($termJSON);
    });

    return json;
  };

  const GenerateUrls = (terms, requestToken, startIndex) => {
    const url = `${Constants.ApiRoot}${Constants.GenerateApi}`;
    const pageSize = Constants.MaxTerms;
    startIndex = startIndex || 0;
    requestToken = requestToken || '';

    const meta = {startIndex: startIndex, maxTerms: pageSize, requestToken: requestToken};
    const $postData = {meta, terms};
    let $error = false;

    ConsoleLog(`Posting -> ${url}`);
    ConsoleLog($postData);
    // $.post(url, $postData).then(data => ConsoleLog(data));
    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify($postData),
      headers: {
        'X-Requested-With':  'XMLHttpRequest',
        'Accept': '*/*',
        'Cache-Control':'no-cache',
      },
      contentType: "application/json; charset=utf-8",

      success: jsonResponse => {
        ConsoleLog(`Process Data -> Start Index: ${startIndex}`);
        const $termsOutput = $('.term-output');
        
        if (startIndex === 0) {
          $termsOutput.html('<ul></ul>');
        };

        const $termsOutputList = $termsOutput.find('ul');
        // TODO METHOD
        const $baseURL = $('#baseURL');
        const $urlParts = $baseURL.val().replace('http://', '').replace('https://', '').split('/');
        const termsPart = $urlParts.pop();
        const domainName = $baseURL.val().replace(termsPart, '');
  
        jsonResponse.data.forEach(term => {
          if (Constants.ShowLinks) {
            $termsOutputList.append(`<li><a target='_blank' href='${domainName}${term}'>${domainName}${term}</a></li>`);
          } else {
            $termsOutputList.append(`<li>${domainName}${term}</li>`);
          }
        });

        // ConsoleLog(data);
        if (jsonResponse.info.hasMoreRecords) {
          GenerateUrls(terms, jsonResponse.info.requestToken, (startIndex + pageSize));
        } else {
          ShowMessage(`Total URL Combinations: ${jsonResponse.info.totalLength}`, 3000, false);
        }

      },
      error: (data, _data1, _data2) => {
        ShowMessage(data);
      }
    });

  };

  $(document).ready(() => {
    const $baseURL = $('#baseURL');
    const $rowTerms = $('.row-terms');

    $baseURL.on('change', evt => {
      HideMessage();
      $rowTerms.hide();
      $('.term-output').html('');
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
      const response = validateTermRanges();

      if(response.success) {
        const json = getTermRangesJSON();
        GenerateUrls(json);
      } else {
        ShowMessage(response.message);
      }
    });
    
    $(document).on('change', '.text-term', event => {
      const $this = $(eval('this'));
      ConsoleLog($this.data());
    });
  });
  
  ConsoleLog(`URL Generator Browser Script..... >>`);
})();