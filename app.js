var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser');
var request = require('request');
var mydb;
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(bodyParser.json())
app.get('/whatsound/api/v1/deezer/track/values', function (req, res) {
    
    res.setHeader('Content-Type','application/json');
    
    var query = req.query.query;
    
    query = (query != null && query != '' && query != "undefined") ? query : null;
    // tipo = tracks, artists, albums
    if (query == null) {
        var result = {
            status: false,
            message: "Bad request, {Empty query}"
        }
        res.status(400).json(result);
    } else {
        var options = {
            url: "https://api.deezer.com/search?q=" + query,
            headers: {
                Accept: 'text/json'
            }
        };
        function callback(error, response, body) {
            var musics = [];
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                console.log(info);
                if (info != ' ') {
                    if (info['data'].length == 0) {
                        var result = {
                            "code": 200,
                            "message": "Musicaaa not found",
                            "status": false
                        }
                        res.status(200).json(result);
                    } else {
                        for (var i in Object.keys(info['data'])) {
                            if (i < 1) {
                                musics.push({
                                    "name": JSON.stringify(info['data'][i]['title_short']).replace(new RegExp('\\"', "g"), ""),
                                    "track_id": (info['data'][i]['id']),
                                    "duration": info['data'][i]['duration'],
                                    "artist": JSON.stringify(info['data'][i]['artist']['name']).replace(new RegExp('\\"', "g"), ""),
                                    "artist_id": (info['data'])[i]['artist']['id'],
                                    "artist_image": JSON.stringify(info['data'][i]['artist']['picture_xl']).replace(new RegExp('\\"', "g"), ""),
                                    "artist_tracklist": JSON.stringify(info['data'][i]['artist']['tracklist']).replace(new RegExp('\\"', "g"), ""),
                                    "album": JSON.stringify(info['data'][i]['album']['title']).replace(new RegExp('\\"', "g"), ""),
                                    "album_id": (info['data'])[i]['album']['id'],
                                    "album_image": JSON.stringify(info['data'][i]['album']['cover_xl']).replace(new RegExp('\\"', "g"), ""),
                                    "album_tracklist": JSON.stringify(info['data'][i]['album']['tracklist']).replace(new RegExp('\\"', "g"), ""),
                                    "track_url": JSON.stringify(info['data'][i]['link']).replace(new RegExp('\\"', "g"), "")
                                });
                            }
                        }
                        res.status(200).json(musics);
                    }
                }else{
                    res.status(500).json({status: false, message : "Internal Server Error" , code : 500});
                }
            } else {
                res.status(response.statusCode).json(body);
            }
        }
        request(options, callback);
    }
});
app.get('/whatsound/api/v1/deezer/track/info/values', function (req, res) {
    
    res.setHeader('Content-Type','application/json');
    
    var query = req.query.query;
    
    var out = JSON.stringify(req.query.query);
    var out2 = out.replace(/[^0-9]/g, ''); 
    var trackUri = parseInt(out2);
    
    query = (query != null && query != '' && query != "undefined") ? query : null;
    // tipo = tracks, artists, albums
    if (query == null) {
        var result = {
            status: false,
            message: "Bad request, {Empty query}"
        }
        res.status(400).json(result);
    } else {
        var optionsInfo = {
            url: "https://api.deezer.com/track/" + trackUri,
            headers: {
                Accept: 'text/json'
            }
        };
        function callbackInfo(error, response, body) {
            var musics = [];
            if (!error && response.statusCode == 200) {
                var infoDeezer = JSON.parse(body);
                if (infoDeezer != ' ') {

                    if (infoDeezer.length == 0) {
                        var result = {
                            "code": 200,
                            "message": "Music info not found",
                            "status": false
                        }
                        res.status(200).json(result);
                    } else {
                          
                        res.status(200).json(infoDeezer);
                    }
                }else{
                    res.status(500).json({status: false, message : "Internal Server Error" , code : 500});
                }
            } else {
                res.status(response.statusCode).json(body);
            }
        }
        request(optionsInfo, callbackInfo);
    }
});
//serve static file (index.html, images, css)
app.use(express.static(__dirname + '/views'));
var port = process.env.PORT || 3000
app.listen(port, function () {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
