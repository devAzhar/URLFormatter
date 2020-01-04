//IIFI
(() => {
  const Constants = {
    ApiRoot: '../../api/v1/',
    GenerateApi: 'execute',
    ShowLinks: true,
    ShowDebugLog: false,
    MaxTerms: 1000,
    AllowOpenMultipleLinks: true
  };

  const getAsciiValue = data => {
    let result = 0;

    data.split('').forEach(element => {
        result += element.charCodeAt(0);
    });

    consoleLog(`Ascii(${data})=${result}`);

    return result;
  }
  const hideMessage = () => $('.error-container').addClass('d-none');
  const showMessage = (msg, autoHideAfter = 0, isError = true) => {
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
  const consoleLog = (msg, _error = false) => {
    if (_error) {
      console.error(msg);
    } else if (Constants.ShowDebugLog) {
      console.log(msg);
    }
  };
  const displayTerms = (data, domainName) => {
    consoleLog(data);
    let $html = '';
    $html = domainName;
    
    data.terms.forEach(element => $html += `<span class='alpha-${element.isAlpha}'>${element.term}</span>`);
    $('.terms-url').html($html);

    $html = `
    <div class="table-responsive">
      <table class="table">
        <thead>
        <tr>
          <th>
            <spa class='d-none d-md-block'>Alphabetical</spa>
            <span class='d-md-none'>Alpha</span>
          </th>
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
        <td class='align-middle'>
          <input type='checkbox' disabled='disabled' ${element.isAlpha ?  'checked' : ''} />
        </td>
        <td class='align-middle'><span class='term alpha-${element.isAlpha}'>${element.term}</span></td>
        <td class='align-middle'>
          <input max-length='5' type='text' class='form-control text-term text-term-start' value='${element.term}' data-term='${element.term}' data-is-alpha='${element.isAlpha}' data-index='${element.index}' />
        </td>
        <td class='align-middle'>
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
    return new Promise((resolve, reject) => {
      const $termsRows = $('.terms-list .row-term');
      let $error = '';

      $termsRows.each((_index, $row) => {
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
        reject($error);
        return;
      }

      resolve();
    });
  };
  const getTermRangesJSON = () => {
    return new Promise(resolve => {
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

      resolve(json);
    });
  };
  const buildPager = (jsonResponse, pageSize, terms) => {
    const $pagers = $('.term-pager');
    const totalPages = Math.ceil(jsonResponse.info.totalLength/pageSize);

    $pagers.hide();

    if (jsonResponse.info.hasMoreRecords && totalPages > 1) {
      const $pageList = $pagers.find('.pagination');
      $pageList.html('');

      for (var pageIndex = 1; pageIndex <= totalPages; pageIndex++) {
        $pageList.append(`<li data-page="${pageIndex}" class="page-item ${pageIndex === 1 ? 'active' : ''}"><a class="page-link" href="javascript:">${pageIndex}</a></li>`);
      }

      $pageList.find('li').on('click', () => {
        const $activePage = $pageList.find('li.active').data('page');
        const $this = $(eval('this'));
        const $page = $this.data('page');

        if ($activePage !== $page) {
          generateUrls(terms, jsonResponse.info.requestToken, (pageSize * ($page - 1)), () => {
            $pageList.find('li').removeClass('active');
            $pageList.find(`li[data-page=${$page}]`).addClass('active');
          });
        }
      });

      $pagers.show().removeClass('d-none');
    }
  };
  const postAjax = (url, postData) => {
    return new Promise((resolve, reject) => {

      if (typeof postData != 'string') {
        postData = JSON.stringify(postData);
      }

      $.ajax({
        url: url,
        type: "POST",
        data: postData,
        headers: {
          'X-Requested-With':  'XMLHttpRequest',
          'Accept': '*/*',
          'Cache-Control':'no-cache',
        },
        contentType: "application/json; charset=utf-8",
        success: responseData => resolve(responseData),
        error: e => reject(e)
      });
    });
  }
  const displayLinks = jsonResponse => {
    const $baseURL = $('#baseURL');
    const $urlParts = $baseURL.val().replace('http://', '').replace('https://', '').split('/');
    const termsPart = $urlParts.pop();
    const domainName = $baseURL.val().replace(termsPart, '');

    const $termsOutput = $('.term-output');
    $termsOutput.html('<ul></ul>');
    const $termsOutputList = $termsOutput.find('ul');

    $termsOutputList.html('');
    jsonResponse.data.forEach(term => {
      if (Constants.ShowLinks) {
        $termsOutputList.append(`
          <li>
            ${Constants.AllowOpenMultipleLinks ? '<input type="checkbox" />' : ''}
            <a target='_blank' href='${domainName}${term}'>${domainName}${term}</a>
          </li>`
        );
      } else {
        $termsOutputList.append(`<li>${domainName}${term}</li>`);
      }
    });
  }
  const generateUrls = (terms, requestToken = '', startIndex = 0, callBack = null) => {
    startIndex = parseInt(startIndex) || 0;
    requestToken = requestToken || '';

    const url = `${Constants.ApiRoot}${Constants.GenerateApi}`;
    const pageSize = parseInt($('#pageSize').val()) || Constants.MaxTerms;
    const meta = {startIndex: startIndex, maxTerms: pageSize, requestToken: requestToken};
    const $postData = {meta, terms};

    consoleLog(`Posting -> ${url}`);
    consoleLog($postData);

    postAjax(url, $postData)
    .then(jsonResponse => {
      consoleLog(`Process Data -> Start Index: ${startIndex}`);
      consoleLog(jsonResponse);

      // Check if it is master call, build the pager
      if(requestToken === '') {
        buildPager(jsonResponse, pageSize, terms);
        showMessage(`Total URL Combinations: ${jsonResponse.info.totalLength}`, 3000, false);
      }
      
      displayLinks(jsonResponse);
      callBack && callBack();
    })
    .catch(e => showMessage(e));
  };
  const onDocumentReady = () => {
    const $baseURL = $('#baseURL');
    const $rowTerms = $('.row-terms');

    $baseURL.on('change', () => {
      hideMessage();
      $rowTerms.hide();
      $('.term-pager').hide();
      $('.term-output').html('');
    });

    $('.btn-get-terms').on('click', () => {
      hideMessage();
      
      const $urlParts = $baseURL.val().replace('http://', '').replace('https://', '').split('/');
      const termsPart = $urlParts.pop();
      if (!termsPart || $urlParts.length === 0) {
        showMessage(`Invalid URL Format.`);
        return;
      };

      $rowTerms.show();
      const domainName = $baseURL.val().replace(termsPart, '');
      const url = `${Constants.ApiRoot}${termsPart}`;

      $.get(url).then(data => displayTerms(data, domainName));
    });

    $(document).on('click', '.btn-generate-urls', () => {
      hideMessage();
      
      validateTermRanges()
      .then(() => {
        getTermRangesJSON()
        .then(data => generateUrls(data));
      })
      .catch(errorMessage => {
        showMessage(errorMessage);
      });
    });
  }
  
  $(document).ready(() => onDocumentReady());
  consoleLog(`URL Generator Browser Script..... >>`);
})();