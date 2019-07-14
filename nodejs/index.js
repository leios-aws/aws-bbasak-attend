var request = require('request-promise');
var config = require('config');
var sleep = require('sleep-promise');
var cheerio = require('cheerio');

exports.handle_roulette = function(event, context, callback) {
    var authConfig = config.get('auth');

    var mainPage = {
        uri: 'http://bbasak.com/',
        method: 'GET',
        qs: {
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko,en-US;q=0.8,en;q=0.6'
        },
        jar: true,
        gzip: true,
        followAllRedirects: true,
        encoding: null
    };
    var loginPage = {
        uri: 'https://bbasak.com/bbs/login_check.php',
        method: 'POST',
        form: {
            mb_id: authConfig.id,
            mb_password: authConfig.pw
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko,en-US;q=0.8,en;q=0.6',
            'Referer': 'http://bbasak.com/'
        },
        jar: true,
        gzip: true,
        followAllRedirects: true,
        encoding: null
    };
    var checkPage = {
        uri: 'http://bbasak.com/games/member_point_proc.php',
        method: 'POST',
        form: {
            bat_point: 0,
            type: "check",
            money_type: "",
            bat_score: 15
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko,en-US;q=0.8,en;q=0.6',
            'Referer': 'http://bbasak.com/games/roulette_v2.php'
        },
        jar: true,
        gzip: true,
        followAllRedirects: true,
        encoding: null
    };

    var roulette_data = [];

    var money_type;
    var bat_point;

    for (var i = 0; i < 6; i++) {
        money_type_rand = Math.floor(Math.random() * 100);
        bat_point_rand = Math.floor(Math.random() * 100);
    
        if (money_type_rand < 40) {
            money_type = "point";
        } else {
            money_type = "cash";
        }
    
        if (bat_point_rand < 10) {
            bat_point = -30;
        } else if (bat_point_rand < 20) {
            bat_point = -15;
        } else if (bat_point_rand < 50) {
            bat_point = 15;
        } else if (bat_point_rand < 80) {
            bat_point = 30;
        } else {
            bat_point = 45;
        }
        roulette_data.push({money_type: money_type, bat_point: bat_point});
    }

    var rewardPage = {
        uri: 'http://bbasak.com/games/member_point_proc.php',
        method: 'POST',
        form: {
            bat_point: bat_point,
            type: "regist",
            money_type: money_type,
            bat_score: 15
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko,en-US;q=0.8,en;q=0.6',
            'Referer': 'http://bbasak.com/games/roulette_v2.php'
        },
        jar: true,
        gzip: true,
        followAllRedirects: true,
        encoding: null
    };

    request(mainPage).then(function(html){
        return request(loginPage);
    }).then(function(html) {
        if (html.indexOf('/bbs/logout.php') > -1) {
            console.log("Login success");
            return roulette_data.reduce((promise, data) => {
                return promise.then(() => {
                    return request(checkPage);
                }).then((html) => {
                    console.log(html.toString());
                    return sleep(5000);
                }).then(() => {
                    rewardPage.form.bat_point = data.bat_point;
                    rewardPage.form.money_type = data.money_type;

                    return request(rewardPage);
                }).then((html) => {
                    console.log(html.toString());
                    console.log(data.bat_point, data.money_type);
                    return sleep(1000);
                });
            }, Promise.resolve());
        } else {
            console.log(html.toString());
        }
    }).catch(function(error) {
        if (error) {
            throw error;
        }
    });

    if (callback) {
        callback(null, 'Success');
    }
};

exports.handler = function(event, context, callback) {
    var authConfig = config.get('auth');

    var mainPage = {
        uri: 'http://bbasak.com/',
        method: 'GET',
        qs: {
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko,en-US;q=0.8,en;q=0.6'
        },
        jar: true,
        gzip: true,
        followAllRedirects: true,
        encoding: null
    };
    var loginPage = {
        uri: 'https://bbasak.com/bbs/login_check.php',
        method: 'POST',
        form: {
            mb_id: authConfig.id,
            mb_password: authConfig.pw
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko,en-US;q=0.8,en;q=0.6',
            'Referer': 'http://bbasak.com/'
        },
        jar: true,
        gzip: true,
        followAllRedirects: true,
        encoding: null
    };

    var attendPage = {
        uri: 'http://bbasak.com/bbs/write.php?bo_table=com25',
        method: 'POST',
        form: {
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 9; Redmi Note 5 Build/PKQ1.180904.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3770.101 Mobile Safari/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'http://m.bbasak.com/view/main/tmp3/app_3.php?ssid=cf11a7795ce1e87d1a703f46ad96c4546403bfa855f098eb419fe514a443805626b51a030e1fdd0338791b8634dc6c04&app_ver=11.5&ls=1'
        },
        jar: true,
        gzip: true,
        followAllRedirects: true,
        encoding: null
    };

    var attendWritePage = {
        uri: 'http://bbasak.com/bbs/write_update.php',
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 9; Redmi Note 5 Build/PKQ1.180904.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/75.0.3770.101 Mobile Safari/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'http://m.bbasak.com/view/main/tmp3/app_3.php?ssid=cf11a7795ce1e87d1a703f46ad96c4546403bfa855f098eb419fe514a443805626b51a030e1fdd0338791b8634dc6c04&app_ver=11.5&ls=1'
        },
        jar: true,
        gzip: true,
        followAllRedirects: true,
        encoding: null
    };

    var checkPage = {
        uri: 'http://bbasak.com/games/member_point_proc.php',
        method: 'POST',
        form: {
            bat_point: 0,
            type: "check",
            money_type: "",
            bat_score: 15
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko,en-US;q=0.8,en;q=0.6',
            'Referer': 'http://bbasak.com/games/roulette_v2.php'
        },
        jar: true,
        gzip: true,
        followAllRedirects: true,
        encoding: null
    };

    var rewardPage = {
        uri: 'http://bbasak.com/games/member_point_proc.php',
        method: 'POST',
        form: {
            bat_point: 0,
            type: "regist",
            money_type: "point",
            bat_score: 15
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko,en-US;q=0.8,en;q=0.6',
            'Referer': 'http://bbasak.com/games/roulette_v2.php'
        },
        jar: true,
        gzip: true,
        followAllRedirects: true,
        encoding: null
    };

    request(mainPage).then(function(html){
        return request(loginPage);
    }).then(function(html) {
        if (html.indexOf('/bbs/logout.php') > -1) {
            console.log("Login success");
            return request(attendPage);
        } else {
            console.log(html.toString());
        }
    }).then(function(html){
        var $ = cheerio.load(html);

        attendWritePage.formData = {
            uid: $('#fwrite > input[type=hidden]:nth-child(1)').val(),
            w: "",
            bo_table: "com25",
            wr_id: 0,
            sca: "",
            sfl: "",
            stx: "",
            spt: "",
            sst: "",
            sod: "",
            page: "",
            board_name: "출첵게시판",
            wr_10: "",
            wr_subject: "출석",
            wr_link1: "",
            nx_seller_nick: "",
            nx_seller_id: "",
            wr_content: "<p>출석처리되었습니다.</p>",
            x: 42,
            y: 18,
            wr_beforeunload: 1
        };
        return request(attendWritePage);
    }).then(function(html) {
        if (html.indexOf('<p>출석처리되었습니다.</p>') > -1) {
            console.log("Attend success");

            var roulette_data = [];

            var money_type;
            var bat_point;
        
            for (var i = 0; i < 6; i++) {
                money_type_rand = Math.floor(Math.random() * 100);
                bat_point_rand = Math.floor(Math.random() * 100);
            
                if (money_type_rand < 40) {
                    money_type = "point";
                } else {
                    money_type = "cash";
                }
            
                if (bat_point_rand < 10) {
                    bat_point = -30;
                } else if (bat_point_rand < 20) {
                    bat_point = -15;
                } else if (bat_point_rand < 50) {
                    bat_point = 15;
                } else if (bat_point_rand < 80) {
                    bat_point = 30;
                } else {
                    bat_point = 45;
                }
                roulette_data.push({money_type: money_type, bat_point: bat_point});
            }
        
            return roulette_data.reduce((promise, data) => {
                return promise.then(() => {
                    return request(checkPage);
                }).then((html) => {
                    console.log(html.toString());
                    return sleep(5000);
                }).then(() => {
                    rewardPage.form.bat_point = data.bat_point;
                    rewardPage.form.money_type = data.money_type;

                    return request(rewardPage);
                }).then((html) => {
                    console.log(html.toString());
                    console.log(data.bat_point, data.money_type);
                    return sleep(1000);
                });
            }, Promise.resolve());
        } else {
            console.log(html.toString());
        }
    }).then(() => {
        var roulette_data = [];

        var money_type;
        var bat_point;
    
        for (var i = 0; i < 6; i++) {
            money_type_rand = Math.floor(Math.random() * 100);
            bat_point_rand = Math.floor(Math.random() * 100);
        
            if (money_type_rand < 40) {
                money_type = "point";
            } else {
                money_type = "cash";
            }
        
            if (bat_point_rand < 10) {
                bat_point = -30;
            } else if (bat_point_rand < 20) {
                bat_point = -15;
            } else if (bat_point_rand < 50) {
                bat_point = 15;
            } else if (bat_point_rand < 80) {
                bat_point = 30;
            } else {
                bat_point = 45;
            }
            roulette_data.push({money_type: money_type, bat_point: bat_point});
        }
    
        return roulette_data.reduce((promise, data) => {
            return promise.then(() => {
                return request(checkPage);
            }).then((html) => {
                console.log(html.toString());
                return sleep(5000);
            }).then(() => {
                rewardPage.form.bat_point = data.bat_point;
                rewardPage.form.money_type = data.money_type;

                return request(rewardPage);
            }).then((html) => {
                console.log(html.toString());
                console.log(data.bat_point, data.money_type);
                return sleep(1000);
            });
        }, Promise.resolve());
    }).catch(function(error) {
        if (error) {
            throw error;
        }
    });

    if (callback) {
        callback(null, 'Success');
    }
};
