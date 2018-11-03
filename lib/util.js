const Wreck = require('wreck');

const internals = {};

module.exports = internals;

internals.getQueryUrl = function(options) {

    const queryString = encodeURIComponent(options.query);

    return 'https://patft.uspto.gov/netacgi/nph-Parser?Sect1=PTO2&Sect2=HITOFF&u=%2Fnetahtml%2FPTO%2Fsearch-adv.htm&r=0&p=' + options.page +
        '&f=S&l=50&Query=' + queryString + '&d=PTXT';
};

internals.getPatentUrl = function(patentId) {

    return "https://patft1.uspto.gov/netacgi/nph-Parser?patentnumber=[ID]".replace("[ID]", patentId);
};

internals.getPdfUrl = function(patentId) {

    if (patentId.length > 8) {
        throw new Error('Patent id too large!');
    }

    if (isNaN(patentId)) {
        const regex = /[a-z]+/ig;
        const match = regex.exec(patentId);

        switch (match[0]) {
            case 'H':
                patentId = patentId.replace(match[0], match[0] + internals.getZeroes(6 - patentId.length));
                break;

            default:
                patentId = patentId.replace(match[0], match[0] + internals.getZeroes(8 - patentId.length));
                break;
        }
    } else {
        patentId = internals.getZeroes(8 - patentId.length) + patentId;
    }

    return 'http://pimg-fpiw.uspto.gov/fdd/' + patentId.substring(6) + '/' + patentId.substring(3, 6) + '/' + patentId.substring(0, 3) +
        '/0.pdf'
};

internals.getZeroes = function(zeroes) {

    let returnStr = '';

    for (var i = 0; i < zeroes; i++) {
        returnStr += '0';
    }

    return returnStr;
};

internals.getUrlHtml = async function(url) {

    return await Wreck.request('GET', url).then(async function(response) {

        return await Wreck.read(response);
    });
};