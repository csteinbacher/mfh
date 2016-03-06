var request = require('request'),
    cheerio = require('cheerio'),
    mongoose = require('mongoose'),
    express = require('express'),
    app = express(),
    poundForPound = [];
    allTheFighters = [];

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

//connect to mongodb and run init
var db = mongoose.connect('mongodb://heroku_ghm8w9df:29up8jqas4q2re8nlh3irv8vk2@ds059938.mlab.com:59938/heroku_ghm8w9df',function(){
    if ( mongoose.connection.readyState == 1 ){
        console.log('connnected to mlbab db ('+mongoose.connection.readyState+') \n calling init');
        init();
    }
});

//define different schemas 
var fighterSchema = new db.Schema({
    fighter_name : String,
    fighter_page_uri : String
})

function testUsernamePop(){
    // db = mongoose.connect('mongodb://heroku_ghm8w9df:29up8jqas4q2re8nlh3irv8vk2@ds059938.mlab.com:59938/heroku_ghm8w9df');

    // var fighterObj = {fighter_name:'Fred',fighter_page_uri:'http://ufc.com/fighter/fred-the-fighter'};

    // db.model('Fighters',fighterSchema).create(fighterObj, function(err,user){
    //     console.log('e- ' + err)
    //     console.log('u- ' + user)
    // })   
}

function init(){
    //pull the rankings 
    pullRankingsList();
}

function pullRankingsList(){
    request('http://www.ufc.com/rankings', function(err,resp,body){
        if ( !err && resp.statusCode == 200 ){
            var $ = cheerio.load(body);

            var allFightersNames = $('td.name-column')
            console.log(allFightersNames.length);

            $(allFightersNames).each(function(){
                var name = $(this).find('a').text();
                name = name.trim();

                var fighterPageUri = $(this).find('a').attr('href');
                fighterObj = [];
                fighterObj.name = name;
                fighterObj.fighterPageUri = fighterPageUri;
                allTheFighters.push(fighterObj);
            })

            //console.log(allTheFighters);

            poundForPound = allTheFighters.slice(0,15);
            updatePoundForPound(poundForPound);
            // console.log(poundForPound);

            //test write body to text file
            // var datBody = $('body').html();

            //fs = require('fs');
            // fs.writeFile('bodytest.txt', flyWeightList, function (err) {
            //   if (err) return console.log(err);
            //   // console.log('Hello World > helloworld.txt');
            // });

        }
    })
}

function updatePoundForPound(poundForPound){
    //empty out the collection first
    db.model('poundforpoundrankings',fighterSchema).remove({}, function(err,success){
        console.log('error - ' + err)
        console.log('success - removed all entries ' + success)

        //populate the pound for pound
        for ( i = 0; i < poundForPound.length; i++ ){
            var fighterObj = {fighter_name:poundForPound[i].name,fighter_page_uri:poundForPound[i].fighterPageUri};

            db.model('poundforpoundrankings',fighterSchema).create(fighterObj, function(err,user){
                console.log('e- ' + err)
                console.log('u- ' + user)
            })

        }
    })
    
}



console.log('err thangs oks');