"use strict";

const cheerio = require('cheerio');

function createStandfirst(source) {
	let usingBody = false;
	let htmlSource = source.openingHTML;
	if (!htmlSource) {
		usingBody = true;
		htmlSource = source.bodyHTML;
	}

	if (htmlSource.indexOf('<p><em>Alphachat is available on <a href="https://www.acast.com/ft-alphachat">Acast</a>, <a href="https://itunes.apple.com/us/podcast/ft-alphachat/id448302257?mt=2">iTunes</a> and <a href="http://www.stitcher.com/podcast/ft-alphachat">Stitcher</a>.</em></p>') !== -1) {
		htmlSource = source.bodyHTML;
		usingBody = true;
		htmlSource = htmlSource.replace('<p><em>Alphachat is available on <a href="https://www.acast.com/ft-alphachat">Acast</a>, <a href="https://itunes.apple.com/us/podcast/ft-alphachat/id448302257?mt=2">iTunes</a> and <a href="http://www.stitcher.com/podcast/ft-alphachat">Stitcher</a>.</em></p>', '');
	}

	const $ = cheerio.load(htmlSource);

	$('figure').remove();

	let summaries = '';

	const paragraphs = $('p');

	const maxPCount = (usingBody) ? Math.min(2, paragraphs.length) : paragraphs.length;

	// first 2 paragraphs if we are using bodyHTML, otherwise full openingHTML
	paragraphs.each((i, p) => {
		if (i < maxPCount) {
			summaries += ' ' + $(p).text();
		}
	});

	source.standfirst = summaries.trim();
}

exports.processArticle = function (article) {
	return new Promise((resolve) => {
		if (article._source) {
			if (!article._source.standfirst) {
				if (article._source.openingHTML || article._source.bodyHTML) {
					createStandfirst(article._source);
				} else if (!article._source.subheading || article._source.subheading === 'Alphachat is available on Acast, iTunes and Stitcher.') {
					article._source.standfirst = article._source.subheading;
				} else {
					article._source.standfirst = '';
				}
			}
		}

		resolve(article);
	});
};
