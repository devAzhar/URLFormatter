import lodash from 'lodash';
const { get } = lodash;

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

export const ExecuteTermRangesHandler = (request, h) => {
    const ranges = request.payload;
    return ExecuteTermRanges(ranges);
};
const getAsciiValue = data => {
    let result = 0;

    data.split('').forEach(element => {
        result += element.charCodeAt(0);
    });

    return result;
}

const cartesianProductOf = () => {
    return _.reduce(arguments, function(a, b) {
        return _.flatten(_.map(a, function(x) {
            return _.map(b, function(y) {
                return x.concat([y]);
            });
        }), true);
    }, [ [] ]);
}

export const ExecuteTermRanges = ranges => {
    const result = new Array();
    // terms = [];
    // terms.push(['a', 'b']);
    // terms.push(['00', '01', '02']);
    // terms.push(['c']);
    // terms.push(['00', '01', '02', '03', '04', '05']);
    
    ranges.forEach(element => {
        result.push({isAlpha: element.isAlpha, isNumber: element.isNumber, rangeStart: element.rangeStart, rangeEnd: element.rangeEnd});
    });

    var data = "";

    for (var index = result.length; index >= 0; index--) {
        
        // let val = getAsciiValue(result[index].rangeStart);
        // const endVal = getAsciiValue(result[index].rangeEnd);

        // for(var j = 0; j < index; j++) {
        //     data += result[j].rangeStart;
        // }

        // while(val++ <= endVal) {
            
        // }
    }

    return result;
};