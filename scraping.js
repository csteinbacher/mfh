var request = require('request'),
	cheerio = require('cheerio'),
	urls = [],
	poundForPound = [];
	allTheFighters = [];

request('http://www.ufc.com/rankings', function(err,resp,body){
	if ( !err && resp.statusCode == 200 ){
		var $ = cheerio.load(body);

		var allFightersNames = $('td.name-column')
        console.log(allFightersNames.length);

        $(allFightersNames).each(function(){
            var name = $(this).find('a').text();
            name = name.trim();

            var fighterPageUrl = $(this).find('a').attr('href');
            fighterObj = [];
            fighterObj.name = name;
            fighterObj.fighterPageUrl = fighterPageUrl;
        	allTheFighters.push(fighterObj);
        })

        //console.log(allTheFighters);

        poundForPound = allTheFighters.slice(0,15);
        console.log(poundForPound);

   		//test write body to text file
		// var datBody = $('body').html();

		//fs = require('fs');
		// fs.writeFile('bodytest.txt', flyWeightList, function (err) {
		//   if (err) return console.log(err);
		//   // console.log('Hello World > helloworld.txt');
		// });




	}
})