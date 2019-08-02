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
    //encoding: null
});

var requestMainPage = function (result,callback) {
    var option = {
        uri: 'http://bbasak.com/',
        method: 'GET',
    };

    req(option, function (err, response, body) {
        result.response = response;
        result.body = body;

        console.log("Request Main Page");
        callback(err, result);
    });
};

var requestLoginPage = function (result, callback) {
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

    req(option, function (err, response, body) {
        result.response = response;
        result.body = body;

        console.log("Request Login Page");
        if (!err && body.indexOf('/bbs/logout.php') < 0) {
            callback("Login Fail!", result);
        } else {
            callback(err, result);
        }
    });
};

var requestAttendPage = function (result, callback) {
    var option = {
        uri: 'http://bbasak.com/bbs/write.php?bo_table=com25',
        method: 'GET',
        headers: {
            'Referer': 'http://bbasak.com/'
        },
    };

    req(option, function (err, response, body) {
        result.response = response;
        result.body = body;

        console.log("Request Attend Page");
        callback(err, result);
    });
};

var requestAttendWritePage = function (result, callback) {
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

    req(option, function (err, response, body) {
        result.response = response;
        result.body = body;

        console.log("Request Attend Write Page");
        if (!err && body.indexOf('<p>출석처리되었습니다.</p>') < 0) {
            callback("Attend fail", result);
        } else {
            callback(err, result);
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
        json: true,
    };

    req(option, function (err, response, body) {
        result.response = response;
        result.body = body;

        console.log("Roulette Check");
        if (!err && body.cnt < 0) {
            callback(body, result);
        } else {
            callback(err, result);
        }
    });
};

var roulettePreWait = function (result, callback) {
    setTimeout(() => {
        callback(null, result);
    }, 5000);
};

var rouletteReward = function (result, callback) {
    var money_type;
    var bat_point;

    var money_type_rand = Math.floor(Math.random() * 100);
    var bat_point_rand = Math.floor(Math.random() * 100);

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

    if (money_type_rand < 40) {
        money_type = "point";
        result.data.point += bat_point;
    } else {
        money_type = "cash";
        result.data.cash += bat_point;
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
        json: true,
    };

    req(option, function (err, response, body) {
        result.response = response;
        result.body = body;

        console.log("Roulette Reward", bat_point, money_type);
        console.log(body);
        callback(err, result);
    });
};

var roulettePostWait = function (result, callback) {
    setTimeout(() => {
        callback(null, result);
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

var requestRoulette = function (result, callback) {
    async.timesSeries(15, executeRoulette, (err) => {
        callback(err);
    });
};

exports.handler = function (event, context, callback) {
    async.waterfall([
        function (callback) {
            callback(null, { data: {point: 0, cash: 0} });
        },
        requestMainPage,
        requestLoginPage,
        requestAttendPage,
        requestAttendWritePage,
        requestRoulette,
    ], function (err, result) {
        console.log({err: err, data: result.data});

        if (callback) {
            callback(null);
        }
    });
};