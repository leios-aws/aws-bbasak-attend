var request = require('request-promise');
var config = require('config');
var sleep = require('sleep-promise');

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

    var money_type;
    var bat_point;

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
            return request(checkPage);
        } else {
            console.log(html.toString());
        }
    }).then((html) => {
        console.log(html.toString());
        return sleep(5000);
    }).then(() => {
        return request(rewardPage);
    }).then(function(html) {
        console.log(html.toString());
        console.log(bat_point, money_type);
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
        uri: 'http://m.bbasak.com/rest/do_attendance.php',
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
        console.log(html.toString());
    }).catch(function(error) {
        if (error) {
            throw error;
        }
    });

    if (callback) {
        callback(null, 'Success');
    }
};
