var spawn = require('child_process').spawn;
var potokNumber = 1;
var functionnotset = true;
var latestlentach = 0;
var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
    key: '',
    cx: ''
});
var Bing = require('node-bing-api')({
    accKey: ""
});

var irc = require('./lib/irc.js');


var options = true;

var silence = false;
var partsilence = false;
var test = false;


if (test) {

    var botchannel = "-test";

} else {
    var botchannel = "";
}
var bot = new irc.Client('chat.us.freenode.net', 'Botname', {
    debug: true,
    messageSplit: 480,
    encoding: 'UTF-8',
    channels: [botchannel],
    floodProtection: true,
    floodProtectionDelay: 1000,
});
process.on('uncaughtException', function(exception) {
    bot.say(botchannel, "В этом месте бот должен бы был упасть c ошбкой " + exception);
});
bot.addListener('error', function(message) {
    console.error('ERROR: %s: %s', message.command, message.args.join('   '));
});

bot.addListener('message' + botchannel, function(from, message) {
    console.log('<%s>   %s', from, message);
});


bot.addListener('names' + botchannel, function(nicks) {

    console.log('--nicks %s', JSON.stringify(nicks));

    if ("Konsolechka" in nicks) {
        bot.say(botchannel, "Привет, Консолечка, рад тебя видеть!");
        console.log('Нашел Консолечку!');

        silence = true;

    } else {
        if ("Konsolka" in nicks) {
            bot.say(botchannel, "Привет, Консолька, рад тебя видеть!");
            console.log('Нашел Консолечку!');

            //partsilence = true;

        } else {

            bot.say(botchannel, "Привет, опять Консолечку не видно, придётся мне работать!");
            console.log('Не нашел Консолечку!');
        }
    }



});


bot.addListener('join' + botchannel, function(nick, message) {
    console.log('--joined <%s> %s ', nick, JSON.stringify(message));
    if (nick == "Konsolechka") {
        bot.say(botchannel, "Привет, Консолечка, наконец-то ты вернулась!");
        silence = true;
    }
    if (nick == "Konsolka") {
        bot.say(botchannel, "Привет, Консолька, наконец-то ты вернулась!");
        //    partsilence = true;
    }

});

bot.addListener('part' + botchannel, function(nick, reason, message) {


    console.log('--parted <%s> %s %s', nick, reason, JSON.stringify(message));

    if (nick == "Konsolechka") {
        bot.say(botchannel, "Консолечка пока! Удачного апгрейда!");
        silence = false;
    }
    if (nick == "Konsolka") {
        bot.say(botchannel, "Консолечка пока! Удачного апгрейда!");
        partsilence = false;
    }

});

bot.addListener('quit', function(nick, reason, channels, message) {
    console.log('--quit <%s> %s --- %s --- %s', nick, reason, JSON.stringify(channels), JSON.stringify(message));

    if (nick == "Konsolechka") {
        bot.say(botchannel, "Консолечка опять отвалилась, заступаю на службу!");
        silence = false;
    }


});




bot.addListener('message', function(from, to, message) {

    var match_kgoogle = new RegExp(
        "^!kgoogle\ (.*)?$", "i"
    );
    var match_kgoogleru = new RegExp(
        "^!kgoogleru(.*)?$", "i"
    );
    var match_kgoogleen = new RegExp(
        "^!kgoogleen(.*)?$", "i"
    );

    var match_pidor = new RegExp(
        "^!пидор$", "i"
    );

    if (match_pidor.test(message)) {

        bot.say(to, "И новым пидором часа становится...");

        setTimeout(function() {
            bot.say(to, from + "! Поздравляем!");

        }, 3000);



    }

    if ((from != 'Konsolechka' && from != 'Konsolka' && !silence && !partsilence) || match_kgoogle.test(message) || match_kgoogleru.test(message) || match_kgoogleen.test(message)) {

        if (functionnotset) {
            functionnotset = false;
            setInterval(function() {
                if (!silence) {
                    var date = new Date();
                    if (date.getSeconds() === 0 && false) {

                        prc = spawn('/usr/bin/phantomjs', ['/home/ircuser/node-irc/phantombody.js', 'test']);
                        prc.stdout.setEncoding('utf8');
                        prc.stdout.on('data', function(data) {


                                var lentachposts = JSON.parse(data);
                                if (lentachposts) {
                                    for (var i = 0; i < lentachposts.length; i++) {
                                        console.log(lentachposts[i].text);
                                        if (lentachposts[i].time > latestlentach) {
                                            latestlentach = lentachposts[i].time;
                                            if (lentachposts[i].text.length < 150) {
                                                bot.say(to, "Лентач: " + lentachposts[i].text + " - https://vk.com" + lentachposts[i].url);
                                            } else {
                                                bot.say(to, "Лентач: " + lentachposts[i].text);
                                                bot.say(to, "https://vk.com" + lentachposts[i].url);
                                            }
                                        }
                                    }
                                }
                            }


                        );
                    }
                }
            }, 1000);
        }


        console.log('<%s-%s>   %s', from, to, message);

        function isBlank(str) {
            return (!str || /^\s*$/.test(str));
        }

        function isRussian(str) {
            var pattern = new RegExp(/[а-яА-ЯЁё]/g);
            if (pattern.test(str)) {
                console.log("Русня");
                return true;

            }
            console.log("Не Русня");
            return false;
        }

        var re_weburl = new RegExp(
            "^.*" +
            //   protocol   identifier
            "(?:(?:https?|ftp)://)" +
            //   user:pass   authentication
            "(?:\\S+(?::\\S*)?@)?" +
            "(?:" +
            //   IP   address   exclusion
            //   private   &   local   networks
            "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
            "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
            "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
            //   IP   address   dotted   notation   octets
            //   excludes   loopback   network   0.0.0.0
            //   excludes   reserved   space   >=   224.0.0.0
            //   excludes   network   &   broacast   addresses
            //   (first   &   last   IP   address   of   each   class)
            "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
            "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
            "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
            "|" +
            //   host   name
            "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
            //   domain   name
            "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
            //   TLD   identifier
            "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
            //   TLD   may   end   with   dot
            "\\.?" +
            ")" +
            //   port   number
            "(?::\\d{2,5})?" +
            //   resource   path
            "(?:[/?#]\\S*)?" +
            ".*$", "i"
        );



        var get_weburl = new RegExp(
            "^(.*)?" +
            //   protocol   identifier
            "((?:(?:https?|ftp)://)" +
            //   user:pass   authentication
            "(?:\\S+(?::\\S*)?@)?" +
            "(?:" +
            //   IP   address   exclusion
            //   private   &   local   networks
            "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
            "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
            "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
            //   IP   address   dotted   notation   octets
            //   excludes   loopback   network   0.0.0.0
            //   excludes   reserved   space   >=   224.0.0.0
            //   excludes   network   &   broacast   addresses
            //   (first   &   last   IP   address   of   each   class)
            "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
            "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
            "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
            "|" +
            //   host   name
            "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
            //   domain   name
            "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
            //   TLD   identifier
            "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
            //   TLD   may   end   with   dot
            "\\.?" +
            ")" +
            //   port   number
            "(?::\\d{2,5})?" +
            //   resource   path
            "(?:[/?#]\\S*)?" +
            ")(.*)?$", "i"
        );

        var match_google = new RegExp(
            "^(!google |!g )(.*)?$", "i"
        );




        if (re_weburl.test(message) && !partsilence) {
            command_to_find = message.match(get_weburl)[2];
            console.log(command_to_find);


            var options = {
                desiredCapabilities: {
                    browserName: 'firefox'
                }
            };
            command_to_find = encodeURI(command_to_find);
            prc = spawn('/usr/bin/phantomjs', ['--proxy=http://10.235.1.1:3128', '/home/ircuser/node-irc/phantom.js', decodeURI(command_to_find)]);
            prc.stdout.setEncoding('utf8');
            prc.stdout.on('data', function(data) {

                var str = data.toString()
                var lines = str.split(/(\r?\n)/g);

                var newtitle = lines.join("");

                var maxLength = 150;
                if (newtitle.length > 150) {
                    //trim the string to the maximum length
                    var trimmedString = newtitle.substr(0, maxLength);

                    //re-trim if we are in the middle of a word
                    trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))

                    newtitle = trimmedString + "...";
                }


                bot.say(to, newtitle);
                console.log(newtitle);
                return 0;
            })


        }

        if (match_google.test(message) || match_kgoogleen.test(message) || match_kgoogleru.test(message)) {

            if (match_google.test(message)) command_to_find = message.match(match_google)[2];
            if (match_kgoogleen.test(message)) command_to_find = message.match(match_kgoogleen)[1];
            if (match_kgoogleru.test(message)) command_to_find = message.match(match_kgoogleru)[1];

            console.log(command_to_find);

            if (isRussian(command_to_find) || match_kgoogleru.test(message)) {

                var searchperformed = false;
                googleSearch.build({
                    q: command_to_find,
                    gl: "ru", //geolocation,
                    lr: "lang_ru",
                    num: 2, // Number of search results to return between 1 and 10, inclusive
                    fileType: "*",
                }, function(error, response) {
                    console.log("ГУГЛ:" + JSON.stringify(response.queries));

                    var googleResponse = response;

                    var linksfinal = [];
                    if (error) console.error(error)
                    if (googleResponse.queries.request[0].totalResults < 2) {
                        var to_i = 1;
                    } else {
                        var to_i = 2;
                    }
                    for (var i = 0; i < to_i; ++i) {
                        console.log(JSON.stringify(googleResponse));
                        if (googleResponse && googleResponse.items) {
                            if (googleResponse.items[i].title && googleResponse.items[i].link) {
                                linksfinal[i] = [googleResponse.items[i].title + ' - ' + decodeURI(googleResponse.items[i].link), googleResponse.items[i].snippet.replace(/\n/g, " ").replace("... ", "")];
                            }
                        }
                    }

                    for (var i = 0; i < linksfinal.length; ++i) {
                        if (linksfinal && linksfinal[i]) {
                            bot.say(to, (i + 1) + ". " + linksfinal[i][0]);
                            searchperformed = true;

                        } else {
                            bot.say(to, (i + 1) + ". В данном месте гугл выдал какую-то хуйню вместо ссылки, извините, ниосилил парсинг");
                        }
                    }
                });
                setTimeout(function() {
                    if (!searchperformed) {

                        Bing.web(command_to_find, {
                            top: 1,
                            options: ['DisableLocationDetection'],
                            market: 'ru-RU'
                        }, function(error, res, body) {
                            // console.log(body);
                            //  console.log(JSON.stringify(body));

                            var title = body.d.results.map(function(r) {
                                return r.Title;
                            });
                            var url = body.d.results.map(function(r) {
                                return r.Url;
                            });
                            console.log(title);


                            if (title == "" && url == "") {
                                bot.say(to, "Нихуя не найдено!");
                            } else {
                                bot.say(to, title + " - " + decodeURI(url));
                            }

                        });

                    }
                }, 3000);
            } else {

                var searchperformed = false;

                googleSearch.build({
                    q: command_to_find,
                    gl: "en", //geolocation,
                    lr: "lang_en",
                    num: 2, // Number of search results to return between 1 and 10, inclusive
                    fileType: "*",
                }, function(error, response) {


                    var googleResponse = response;

                    var linksfinal = [];
                    if (googleResponse.queries.request[0].totalResults < 2) {
                        var to_i = 1;
                    } else {
                        var to_i = 2;
                    }
                    for (var i = 0; i < to_i; ++i) {
                        console.log(JSON.stringify(googleResponse));
                        if (googleResponse && googleResponse.items) {
                            if (googleResponse.items[i].title && googleResponse.items[i].link) {
                                if (!isBlank(googleResponse.items[i].link)) {
                                    linksfinal[i] = [googleResponse.items[i].title + ' - ' + decodeURI(googleResponse.items[i].link), googleResponse.items[i].snippet.replace(/\n/g, " ").replace("... ", "")];
                                }
                            }
                        }
                    }

                    for (var i = 0; i < linksfinal.length; ++i) {
                        if (linksfinal && linksfinal[i]) {
                            bot.say(to, (i + 1) + ". " + linksfinal[i][0]);
                            searchperformed = true;
                        } else {
                            bot.say(to, (i + 1) + ". В данном месте гугл выдал какую-то хуйню вместо ссылки, извините, ниосилил парсинг");
                        }
                    }
                });
                setTimeout(function() {
                    if (!searchperformed) {
                        Bing.web(command_to_find, {
                            top: 1,
                            options: ['DisableLocationDetection'],
                            market: 'en-US'
                        }, function(error, res, body) {
                            // console.log(body);
                            //  console.log(JSON.stringify(body));

                            var title = body.d.results.map(function(r) {
                                return r.Title;
                            });
                            var url = body.d.results.map(function(r) {
                                return r.Url;
                            });


                            if (title == "" && url == "") {
                                bot.say(to, "Нихуя не найдено!");
                            } else {
                                bot.say(to, title + " - " + decodeURI(url));
                            }

                        });

                    }
                }, 3000);
            }

        }

        if (match_kgoogle.test(message)) {
            var num_quotes = 3;
            var rand_no = Math.floor(num_quotes * Math.random());
            switch (rand_no) {
                case 0:
                    my_output = "Нахуй иди, пидор!";
                    break;
                case 1:
                    my_output = "А ну отъебался от меня, чмошник!";
                    break;
                case 2:
                    my_output = "Ща в ебало отхватишь, хуесос!";
                    break;
                default:
                    my_output = "Съебись на хуй, мудила!";
            }
            bot.say(to, my_output);

        }




    }
});