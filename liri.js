require("dotenv").config();

var keys = require('./keys.js');
var Spotify = require('node-spotify-api');
const cTable = require('console.table');
var bandsintown = require('bandsintown')('trilogy');
var request = require('request');
var fs = require('fs');


var spotify = new Spotify({
    id: keys.spotify.id,
    secret: keys.spotify.secret
});


function spotifyThis(songName) {

    spotify.search({
        type: 'track',
        query: songName,
        limit: 10
    }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        console.log("artist name  :", data.tracks.items[0].album.artists[0].name);
        console.log("song name: ", data.tracks.items[0].name);
        console.log("preview url: ", data.tracks.items[0].href);
        console.log("Album name", data.tracks.items[0].album.name);
        var songResult = [];
        data.tracks.items.forEach(e => {
            var song = {
                'Artist_name': e.album.artists[0].name,
                'Song_Name': e.name,
                'Preview_Url': e.href,
                'Album_Name': e.name
            }
            songResult.push(song);
        });

        const table = cTable.getTable(songResult);

        console.log(table);


        fs.appendFile("log.txt", "\n" + table, function (err) {
            if (err) {
                return console.log(err);
            } else {
                console.log("log.txt was updated");
            }
        });
    });
}


function bandsInTown(artist) {
    bandsintown
        .getArtistEventList(artist)
        .then(function (events) {
            var band = {
                Venue: events[0].venue.name,
                Location: events[0].venue.city + ", " + events[0].venue.region,
                Time: events[0].formatted_datetime
            }

            console.log(band);

            fs.appendFile("log.txt", "\nVenue: " + band.Venue + "\nLocation: " + band.Location + "\nTime: " + band.Time, function (err) {
                if (err) {
                    return console.log(err);
                } else {
                    console.log("log.txt was updated");
                }
            });
        });
}


function movieSearch(title) {
    var URL = "http://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=trilogy";
    request(URL, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var movie = {
                Title: JSON.parse(body).Title,
                Year: JSON.parse(body).Year,
                IMDB_Rating: JSON.parse(body).imdbRating,
                Rotten_Tomatoes_Rating: JSON.parse(body).Ratings[1].Value,
                Country: JSON.parse(body).Country,
                Language: JSON.parse(body).Language,
                Plot: JSON.parse(body).Plot,
                Actors: JSON.parse(body).Actors,
            }

            console.log(movie);

            fs.appendFile("log.txt", "\nTitle: " + movie.Title + "\nYear: " + movie.Year + "\nIMDB Rating: " + movie.IMDB_Rating + "\nRotten Tomatoes Rating: " + movie.Rotten_Tomatoes_Rating + "\nCountry: " + movie.Country + "\nLanguage: " + movie.Language + "\nPlot: " + movie.Plot + "\nActors: " + movie.Actors, function (err) {
                if (err) {
                    return console.log(err);
                } else {
                    console.log("log.txt was updated");
                }
            });
        } else {
            console.log(error);
            console.log(response.statusCode);
        }
    });
}

function random() {
    fs.readFile("random.txt", "utf8", function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log()

        fs.appendFile("log.txt", "\n" + data, function (err) {
            if (err) {
                return console.log(err);
            } else {
                console.log("log.txt was updated");
            }
        });

        spotifyThis(data);
    });
}


switch (process.argv[2]) {
    case 'spotify-this-song':
        var resultFormatted = process.argv.slice(3, process.argv.length).join(" ");
        spotifyThis(resultFormatted);
        break;
    case 'concert-this':
        var artistFormatted = process.argv.slice(3, process.argv.length).join(" ");
        bandsInTown(artistFormatted);
        break;
    case 'movie-this':
        var movieFormatted = process.argv.slice(3, process.argv.length).join("+");
        movieSearch(movieFormatted);
        break;
    case 'do-what-it-says':
        random();
        break;
    default:
        console.log('invalid entry');
}