const request = require('request');
const config = require('config');
const cheerio = require('cheerio');
const async = require('async');

var req = request.defaults({
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
});

var requestMainPage = function (callback) {
    var option = {
        uri: 'http://bbasak.com/',
        method: 'GET',
    };

    req(option, function (e, r, b) {
        console.log("Request Main Page");
        callback(e, r, b);
    });
};

var requestLoginPage = function (response, body, callback) {
    var authConfig = config.get('auth');
    var option = {
        uri: 'https://bbasak.com/bbs/login_check.php',
        method: 'POST',
        form: {
            mb_id: authConfig.id,
            mb_password: authConfig.pw
        },
        headers: {
            'Referer': 'http://bbasak.com/'
        },
    };

    req(option, function (e, r, b) {
        console.log("Request Login Page");
        if (!e && b.indexOf('/bbs/logout.php') < 0) {
            callback("Login Fail!", r, b);
        } else {
            callback(e, r, b);
        }
    });
};

var requestAttendPage = function (response, body, callback) {
    var option = {
        uri: 'http://bbasak.com/bbs/write.php?bo_table=com25',
        method: 'GET',
        headers: {
            'Referer': 'http://bbasak.com/'
        },
    };

    req(option, function (e, r, b) {
        console.log("Request Attend Page");
        callback(e, r, b);
    });
};

var requestAttendWritePage = function (response, body, callback) {
    var $ = cheerio.load(body);
    var option = {
        uri: 'http://bbasak.com/bbs/write_update.php',
        method: 'POST',
        formData: {
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
        },
        headers: {
            'Referer': 'http://bbasak.com/bbs/write.php?bo_table=com25'
        },
    };

    req(option, function (e, r, b) {
        console.log("Request Attend Write Page");
        if (!e && b.indexOf('<p>출석처리되었습니다.</p>') < 0) {
            callback("Attend fail", r, b);
        } else {
            callback(e, r, b);
        }
    });
};

var rouletteCheck = function (callback) {
    var option = {
        uri: 'http://bbasak.com/games/member_point_proc.php',
        method: 'POST',
        form: {
            bat_point: 0,
            type: "check",
            money_type: "",
            bat_score: 15
        },
        headers: {
            'Referer': 'http://bbasak.com/games/roulette_v2.php'
        },
    };

    req(option, function (e, r, b) {
        console.log("Roulette Check");
        var status = JSON.parse(b);
        if (!e && status.cnt < 0) {
            callback(status, r, b);
        } else {
            callback(e, r, b);
        }
    });
};

var roulettePreWait = function (response, body, callback) {
    setTimeout(() => {
        callback(null, response, body);
    }, 5000);
};

var rouletteReward = function (response, body, callback) {
    var money_type;
    var bat_point;

    var money_type_rand = Math.floor(Math.random() * 100);
    var bat_point_rand = Math.floor(Math.random() * 100);

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

    var option = {
        uri: 'http://bbasak.com/games/member_point_proc.php',
        method: 'POST',
        form: {
            bat_point: bat_point,
            type: "regist",
            money_type: money_type,
            bat_score: 15
        },
        headers: {
            'Referer': 'http://bbasak.com/games/roulette_v2.php'
        },
    };

    req(option, function (e, r, b) {
        console.log("Roulette Reward", bat_point, money_type);
        console.log(JSON.parse(b));
        callback(e, r, b);
    });
};

var roulettePostWait = function (response, body, callback) {
    setTimeout(() => {
        callback(null, response, body);
    }, 1000);
};

var executeRoulette = function (index, callback) {
    async.waterfall([
        rouletteCheck,
        roulettePreWait,
        rouletteReward,
        roulettePostWait,
    ], function (err) {
        callback(err);
    });
};

var requestRoulette = function (response, body, callback) {
    async.timesSeries(15, executeRoulette, (err) => {
        callback(err);
    });
};

exports.handler = function (event, context, callback) {
    async.waterfall([
        requestMainPage,
        requestLoginPage,
        requestAttendPage,
        requestAttendWritePage,
        requestRoulette,
    ], function (err) {
        if (err) {
            console.log(err);
        }

        if (callback) {
            callback(null, 'Success');
        }
    });
};