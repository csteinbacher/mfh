var request = require('request'),
	cheerio = require('cheerio'),
	urls = [];

request('http://google.com/', function(err,resp,body){
	if ( !err && resp.statusCode == 200 ){
		var $ = cheerio.load(body);
		
		console.log($('#hplogo').attr('src'));
		//$('img').each(urls.push($(this).attr('href')));
		//urls.push()
		//console.log(urls)

	}
})