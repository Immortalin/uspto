const Cheerio = require('cheerio');
const Util = require('../util');

module.exports = function(payload) {

    return new Promise(function(resolve, reject) {

        const html = Cheerio.load(payload);

        const patentId = html('table').eq(2).find('b').eq(1).text().replace(/,/g, '');

        const returnValue = {
            patentId: patentId,
            title: html('font').eq(3).text().replace(/\n/g, '').replace(/    /g, ''),
            url: Util.getPatentUrl(patentId),
            pdf: Util.getPdfUrl(patentId)
        };

        resolve(returnValue);
    });
};