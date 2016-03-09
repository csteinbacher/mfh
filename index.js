var request = require('request'),
    cheerio = require('cheerio'),
    mongoose = require('mongoose'),
    express = require('express'),
    app = express(),
    poundForPound = [],
    allTheFighters = [],
    allTheChamps = [];

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

function init(){
    //pull the rankings 
    pullRankingsList();
}

function pullRankingsList(){
    request('http://www.ufc.com/rankings', function(err,resp,body){
        if ( !err && resp.statusCode == 200 ){
            var $ = cheerio.load(body);

            //grabbing all the fighters excluding the camps
            var allFightersNames = $('td.name-column')
            // console.log(allFightersNames.length);
            $(allFightersNames).each(function(){
                var name = $(this).find('a').text();
                name = name.trim();

                var fighterPageUri = $(this).find('a').attr('href');
                fighterObj = [];
                fighterObj.name = name;
                fighterObj.fighterPageUri = fighterPageUri;
                allTheFighters.push(fighterObj);
            })

            //grabbing the champs
            var champsList = $('.rankings-champions');
            $(champsList).each(function(){
                var nameWrapper = $(this).find('.fighter-name');
                var name = $(nameWrapper).find('a').text();
                console.log(name)

                var fighterPageUriWrapper =  $(this).find('.fighter-name');
                var fighterPageUri = $(fighterPageUriWrapper).find('a').attr('href');
                fighterObj = [];
                fighterObj.name = name;
                fighterObj.fighterPageUri = fighterPageUri;
                allTheChamps.push(fighterObj);
            })
            allTheChamps = allTheChamps.splice(1,10);


            poundForPound = allTheFighters.slice(0,15);
            updatePoundForPound(poundForPound);
            
            //update the flyweight class 
            updateWeightClass("flyweight",allTheChamps[0],allTheFighters.slice(15,30))

            //update the BANTAMWEIGHT class 
            updateWeightClass("bantamweight",allTheChamps[1],allTheFighters.slice(30,45))

            //update the FEATHERWEIGHT class 
            updateWeightClass("featherweight",allTheChamps[2],allTheFighters.slice(45,60))

            //update the LIGHTWEIGHT class 
            updateWeightClass("lightweight",allTheChamps[3],allTheFighters.slice(60,75))

            //update the WELTERWEIGHT class 
            updateWeightClass("welterweight",allTheChamps[4],allTheFighters.slice(75,90))

            //update the MIDDLEWEIGHT class 
            updateWeightClass("middleweight",allTheChamps[5],allTheFighters.slice(90,105))

            //update the LIGHT HEAVYWEIGHT class 
            updateWeightClass("lightheavyweight",allTheChamps[6],allTheFighters.slice(105,120))

            //update the HEAVYWEIGHT class 
            updateWeightClass("heavyweight",allTheChamps[7],allTheFighters.slice(120,135))

            //update the WOMEN'S STRAWWEIGHT class 
            updateWeightClass("womensstrawweight",allTheChamps[8],allTheFighters.slice(135,150))

            //update the WOMEN'S BANTAMWEIGHT class 
            updateWeightClass("womensbantamweight",allTheChamps[9],allTheFighters.slice(150,165))
            
            



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

function updateWeightClass(weightClassName,champ,topFifteen){
    // console.log(weightClassName)
    // console.log(champ)
    // console.log(topFifteen)

    db.model(weightClassName,fighterSchema).remove({}, function(err,success){
        console.log('error - ' + err)
        console.log('success - removed all entries ' + success)

        //populate the weightclasss with a champ
        var fighterObj = {fighter_name:champ.name,fighter_page_uri:champ.fighterPageUri};
        db.model(weightClassName,fighterSchema).create(fighterObj, function(err,user){
            console.log('e- ' + err)
            console.log('u- ' + user)
            //on success populate the rest of the weightclass
            if ( !err ){
                //populate the weightclass with fighters ranked 1-15 ( no champ)
                for ( i = 0; i < topFifteen.length; i++ ){
                    var fighterObj = {fighter_name:topFifteen[i].name,fighter_page_uri:topFifteen[i].fighterPageUri};

                    db.model(weightClassName,fighterSchema).create(fighterObj, function(err,user){
                        console.log('e- ' + err)
                        console.log('u- ' + user)
                    })
                }
            }
        })
    })
}



console.log('err thangs oks');