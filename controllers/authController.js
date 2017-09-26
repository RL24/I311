const express = require('express');
const fs = require('fs');

function XOR_hex(a, b) {
    var res = "";
    var i = a.length;
    var j = b.length;
    while (i-->0 && j-->0)
        res = (parseInt(a.charAt(i), 16) ^ parseInt(b.charAt(j), 16)).toString(16) + res;
    return res;
}

exports.index = (req, res) => {
    res.redirect('/login');
};

exports.login = (req, res) => {
    res.render('login', {title: 'Login'});
};

exports.login_post = (req, res) => {
    if (req.session.user)
        res.redirect('back');
    else {
        var login = req.body.login.toLowerCase();
        var dboUser = req.db.get('users').findUser(login);
        var user = dboUser.value();

        if (user != null) {
            var password = XOR_hex(req.body.password, user.salt);
            if (user.password == req.sha1(password)) {
                var date = Date();
                var salt = req.sha1(user.uid + date);
                password = XOR_hex(req.body.password, salt);

                dboUser.assign({
                    password: req.sha1(password),
                    lastLogin: date,
                    salt: salt
                }).write();
                req.session.user = new req.User(user.uid, user.email, user.username, user.hiddenPosts);

                if (!fs.existsSync(`./public/images/avatar/${user.uid}.png`))
                    req.helper.getAvatar(user.uid, req, res);
                else
                    res.redirect('/');
                return;
            }
        }
        res.redirect('back');
    }
};

exports.register = (req, res) => {
    res.render('register', {title: 'Register'});
};

exports.register_post = (req, res) => {
    var exists = req.db.get('users').find({
        email: req.body.email
    }).value();
    if (exists) {
        res.redirect('back');
        return;
    }
    var date = Date();
    var uuid = req.uuid();
    var salt = req.sha1(uuid + date);
    var password = XOR_hex(req.body.password, salt);
    req.db.get('users').push({
        uid: uuid,
        email: req.body.email,
        username: req.body.username,
        password: req.sha1(password),
        hiddenPosts: [],
        lastLogin: date,
        salt: salt
    }).write();

    res.redirect('/');
};

exports.forgot_password = (req, res) => {
    res.render('forgot_password', {title: 'Forgot Password'});
};

exports.forgot_password_post = (req, res) => {
    res.redirect('/');
};

exports.logout = (req, res) => {
    if (req.session.user)
        delete req.session.user;
    res.redirect('/');
};

exports.terminate = (req, res) => {
    if (req.session.user) {
        req.db.get('users').remove({
            uid: req.session.user.uid
        }).write();
        req.db.get('posts').remove({
            author_uid: req.session.user.uid
        }).write();
    }
    res.redirect('/logout');
};