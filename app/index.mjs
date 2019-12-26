import lodash from 'lodash';
const { get, reduce, flatten, map, set } = lodash;

export const HelloWorld = (_request, _h) => {
    return {Message: 'HelloWorld!'};
}

const isValidElement = element => {
    if(element === '') {
        return false;
    }

    var elementVal = element.charCodeAt(0);
    
    //Numbers 0-9
    if(elementVal >= 48 && elementVal <= 57) {
        return true;
    }

    //Alphabets A-Z
    if(elementVal >= 65 && elementVal <= 90) {
        return true;
    }

    //Alphabets a-z
    if(elementVal >= 97 && elementVal <= 122) {
        return true;
    }

    return false;
};

export const ParseTerms = urlFormat => {
    const terms = new Array();
    let tempTerm = '';

    urlFormat.split('').forEach(element => {
        if (!isValidElement(element)) {
            // Do Nothing, move to the next element
        } else if (tempTerm === '') {
            tempTerm = element;
        } else if(isNaN(tempTerm) && isNaN(element)) { //Case when we have alphabets
            tempTerm += element;
        } else if(!isNaN(tempTerm) && !isNaN(element)) { //Case when we have numbers
            tempTerm += element;
        } else {  //Case when we have a change from alphabet to number or number to alphabet
            terms.push({index: terms.length, term: tempTerm, isNumber: !isNaN(tempTerm), isAlpha: isNaN(tempTerm)});
            tempTerm = element;
        }
    });

    tempTerm && terms.push({index: terms.length, term: tempTerm, isNumber: !isNaN(tempTerm), isAlpha: isNaN(tempTerm)});

    return terms;
};

export const GenerateUrls = (request, h) => {
    console.log(`Method: GenerateUrls -> Start ${new Date()}`);
    const urlFormat = get(request.params, 'urlFormat', '').trim();
    
    const terms = ParseTerms(urlFormat);
    console.log(`Method: GenerateUrls -> End ${new Date()}`);
    return {urlFormat: urlFormat, terms};
    // params: request.params, 
}

const getGUID = (separator='-') => {
    const S4 = () => ((((1+Math.random())*0x10000)|0).toString(16).substring(1));
    // then to call it, plus stitch in '4' in the third group
    return (S4() + S4() + separator + S4() + separator + S4().substr(0,3) + separator + S4() + separator + S4() + S4() + S4()).toLowerCase();
};

export const ExecuteTermRangesHandler = (request, _h) => ExecuteTermRanges(request);

const getNextElement = (term, length = 1, paddChar = '') => {
    let nextElement = null;

    if(isNaN(term)) {
        const ascii = term.charCodeAt(0);
        nextElement = String.fromCharCode(ascii + 1); 
    } else {
        nextElement = (parseInt(term) + 1).toString();

        while(nextElement.length < length) {
            nextElement = '0' + nextElement;
        }
    }

    return {term: nextElement, value: getAsciiValue(nextElement)};
};

const getAsciiValue = data => {
    let result = 0;

    data.split('').forEach(element => {
        result += element.charCodeAt(0);
    });

    return result;
}

const cartesianProductOf = (args) => {
    const reducedArray = reduce(args, function(a, b) {
        return flatten(map(a, function(x) {
            return map(b, function(y) {
                return x.concat([y]);
            });
        }), true);
    }, [ [] ]);

    const returnArray = new Array();

    reducedArray.forEach(element => {
        returnArray.push(element.join(''));
    });
    return returnArray;
}

const getTermArray = ranges => {
    const termsArray = new Array();
    let nextTerm = '';

    ranges.forEach(range => {
        const term = new Array();
        const endVal = getAsciiValue(range.rangeEnd);
        nextTerm = {term: range.rangeStart};

        if (range.rangeStart.length === range.rangeEnd.length) {
            
            if (!isNaN(range.rangeStart) || range.rangeStart.length === 1) {
                term.push(range.rangeStart);

                while((nextTerm = getNextElement(nextTerm.term, range.rangeEnd.length)).value <= endVal) {
                    term.push(nextTerm.term);
                }
            } else {
                const listOfTerms = new Array();
                console.log(`HANDLE -> ${range.rangeStart} -> ${range.rangeEnd}`);

                range.rangeStart.split('').forEach((element, index) => {
                    const innerTerms = new Array();
                    const termEndVal = getAsciiValue(range.rangeEnd[index]);
                    
                    innerTerms.push(element);
                    nextTerm = {term: element};

                    while((nextTerm = getNextElement(nextTerm.term, element.length)).value <= termEndVal) { 
                        innerTerms.push(nextTerm.term);
                    };

                    listOfTerms.push(innerTerms);
                });

                // const temp = [['x', 'y'], ['A','B','C'], ['a','b','c','d']];
                // const res = cartesianProductOf(temp);
                // console.log(temp);
                // console.log(listOfTerms);

                const res = cartesianProductOf(listOfTerms);

                res.forEach(element => {
                    term.push(element);
                });
            }
        } 
        
        if (term.length > 0) {
            termsArray.push(term);
        }
    });

    // console.log(termsArray);
    return termsArray;
};

export const ExecuteTermRanges = request => {
    try {
    const startTime = new Date();
    const payload = get(request, 'payload', {});
    const session = get(request, 'session', {});
    const ranges = get(payload, 'terms', payload);
    const meta = get(payload, 'meta', {});
    
    const forceLoad = get(payload, 'forceLoad', false);
    var $token = get(meta, 'requestToken', '') || getGUID('');
    const $dataSessionKey = 'sdata_' + $token.substring(0, 8);

    // For force load, clear previous session data if any
    if (forceLoad) {
        set(session, $dataSessionKey, []);
    }

    let data = [];

    console.log(`Trying to load from session - ${new Date()}.`);
    data = get(session, $dataSessionKey, data);

    if (data.length === 0) {
        console.log(`Making the call to => getTermArray`);
        const terms = getTermArray(ranges);
        data = cartesianProductOf(terms);

        set(session, $dataSessionKey, data);
    } else {
        console.log(`Data Loaded from the session - ${new Date()}.`);
    }

    const startIndex = meta.startIndex || 0;
    var maxTerms = meta.maxTerms || data.length;

    console.log($token);
    console.log($dataSessionKey);

    maxTerms = maxTerms-startIndex > data.length ? data.length : maxTerms;
    const returnData = data.slice(startIndex, startIndex + maxTerms);

    const hasMoreRecords = startIndex + maxTerms < data.length ? true : false;

    if (!hasMoreRecords) {
        set(session, $dataSessionKey, []);
    }

    const endTime = new Date();

    return {
        info: {
            totalLength: data.length,
            returnedLength: returnData.length,
            requestToken: $token,
            startIndex: startIndex,
            hasMoreRecords,
            timeTaken: `${(endTime-startTime)/1000} seconds`
        },
        data: returnData,
    };
    } catch (_exp) {
        console.log(_exp);
    }
};