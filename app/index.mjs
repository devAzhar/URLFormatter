import lodash from 'lodash';
const { get, reduce, flatten, map } = lodash;

export const HelloWorld = (request, h) => {
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
    return {params: request.params, urlFormat: urlFormat, terms};
}

export const ExecuteTermRangesHandler = (request, _h) => {
    const ranges = request.payload.terms || request.payload;
    return ExecuteTermRanges(ranges, request.payload.meta);
};

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

export const ExecuteTermRanges = (ranges, meta) => {
    const terms = getTermArray(ranges);
    const data = cartesianProductOf(terms);
    var returnData = new Array();
    var maxTerms = meta.maxTerms || data.length;
    
    data.forEach((element, index) => {
        if (index <= maxTerms) {
            returnData.push(element);
        }
    });

    console.log(data.length);
    // returnData = returnData.replace(/aaa/g, 'G');
    // returnData = "meta";
    // console.log(meta);
    return returnData;
};