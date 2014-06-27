var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.set('Content-Type', 'application/json');
    next();
});

//app.use('/', routes);
//app.use('/users', users);

var router = express.Router();

var team = {
    members: [
    ]
};

var memberId = 1;

router.get('/team', function(req, res) {
    res.send(200, team);
});

router.get('/team/members', function(req, res) {
    res.send(200, team.members);
});

router.post('/team/members', function(req, res) {
    var newMember = {
        id: memberId,
        name: req.param('name'),
        email: req.param('email')
    };

    if (!duplicateEmail(req.param('email'))) {
        team.members.push(newMember);
        memberId += 1;
        res.send(200, newMember);
    } else {
        res.send(400, { msg: "duplicate email" });
    }
});

var duplicateEmail = function(email) {
    var current;

    for (var m in team.members) {
        current = team.members[m];
        if ( current.email == email ) { return true;  }
    }

    return false;
};

router.get('/team/members/:id', function(req, res) {
    var id = req.param('id');

    var currentMember;
    for (var index in team.members) {
        currentMember = team.members[index];
        if (currentMember.id == id) {
            member = currentMember;
        }
    }

    res.send(200, member);
});

router.delete('/team/members/:id', function(req, res) {
    var id = req.param('id');

    var member;
    for (var index in team.members) {
        member = team.members[index];
        if (member.id == id) {
          team.members.splice(index, 1);
        }
    }

    res.send(200, team);
});

var rouletteRouter = express.Router();

rouletteRouter.post('/', function(req, res) {
    var days = Math.floor(Math.random() * 3) + 1;
    var n = Math.floor(Math.random() * team.members.length);
    var member = team.members[n];
    var now = new Date();

    var msg = member.name + " is staying home for " + days + " days starting immediately";

    res.send(200, {
        "result": msg
        }
    );
});

app.use('/', router);
app.use('/roulette', rouletteRouter);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
