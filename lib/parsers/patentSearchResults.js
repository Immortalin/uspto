const Cheerio = require('cheerio');
const Util = require('../util');

const Parsers = {
    patentDetails: require('./patentDetails')
};

module.exports = function(payload) {

    return new Promise(function(resolve, reject) {

        const html = Cheerio.load(payload);
        const returnValue = {
            patentList: []
        };

        const paginationText = html('i').eq(1).text();
        const regex = /([0-9]+)/g;

        const match = regex.exec(paginationText);

        if (!match) {
            // Check if there is one result
            if (html('head title').text() === 'Single Document' && html('head meta').attr('http-equiv') === 'REFRESH') {
                const redirectUrl = html('head meta').attr('content').substring(6);

                // Retrieve the title of the patent.
                return resolve(Util.getUrlHtml('https://patft.uspto.gov' + redirectUrl).then(function(payload) {

                    return Parsers.patentDetails(payload);
                }).then(function(data) {

                    returnValue.startIndex = 0;
                    returnValue.endIndex = 1;
                    returnValue.totalCount = 1;

                    returnValue.patentList.push({
                        id: data.patentId,
                        url: data.url,
                        pdf: data.pdf,
                        title: data.title
                    });

                    return returnValue;
                }));
            }

            // There are no results
            returnValue.startIndex = 0;
            returnValue.endIndex = 0;
            returnValue.totalCount = 0;

            return resolve(returnValue);

        } else {
            returnValue.startIndex = Number(match[0]) - 1;
            returnValue.endIndex = Number(regex.exec(paginationText)[0]) - 1;
            returnValue.totalCount = Number(regex.exec(paginationText)[0]);
        }

        let last = null;
        html('table').eq(1).find('td').each(function(index) {

            if (index < 2) {
                return;
            }

            switch ((index - 2) % 4) {
                case 1:
                    {
                        var patentId = html(this).text().replace(/,/g, '');
                        last = {
                            id: patentId,
                            url: Util.getPatentUrl(patentId),
                            pdf: Util.getPdfUrl(patentId)
                        };
                        break;
                    }

                case 3:
                    {
                        last['title'] = html(this).text().replace(/\n/g, '').replace(/    /g, '');
                        returnValue.patentList.push(last);
                        break;
                    }
            }
        });

        return resolve(returnValue);
    });
};