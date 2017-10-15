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
    if (req.session.user)
        res.redirect('/');
    else
        res.render('login', {title: 'Login'});
};

exports.login_post = (req, res) => {
    if (req.session.user)
        res.redirect('back');
    else {
        var login = req.body.login.toLowerCase();
        var dboUser = req.db.get('users').findUser(login);
        var user = dboUser.value();

        req.helper.getUserByEmailOrUsername(req.mysql, login, (user) => {
            if (user != null) {
                var password = req.sha1(XOR_hex(req.body.password, user.salt));
                if (user.password == password) {
                    var date = new Date();
                    var salt = req.sha1(user.uid + date);
                    password = req.sha1(XOR_hex(req.body.password, salt));

                    req.helper.createOrUpdateUser(req.mysql, user.uid, user.email, user.username, password, date, salt, (result) => {
                        if (result) {
                            req.helper.getHiddenPostsByUserUid(req.mysql, user.uid, (hidden) => {
                                req.session.user = new req.User(user.uid, user.email, user.username, hidden);
                                if (!fs.existsSync(`./public/images/avatar/${user.uid}.png`)) {
                                    req.helper.getAvatar(user.uid, req, res);
                                    return;
                                } else
                                    res.redirect('/');
                            });
                        } else
                            res.redirect('back');
                    });
                    return;
                }
            }
            res.redirect('back');
        });

        /*if (user != null) {
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
        res.redirect('back');*/
    }
};

exports.register = (req, res) => {
    if (req.session.user)
        res.redirect('/');
    else
        res.render('register', {title: 'Register'});
};

exports.register_post = (req, res) => {
    var email = req.body.email;
    var username = req.body.username;
    var uuid = req.uuid();
    var date = new Date();
    var salt = req.sha1(uuid + date);
    var password = req.sha1(XOR_hex(req.body.password, salt));

    req.helper.getUserByEmailOrUsername(req.mysql, email, (user) => {
        if (user != null)
            res.redirect('back');
        else
            req.helper.createOrUpdateUser(req.mysql, uuid, email, username, password, date, salt, (result) => {
                res.redirect('/');
            });
    });

    /*var exists = req.db.get('users').find({
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

    res.redirect('/');*/
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
        var uid = req.session.user.uid;
        req.helper.removeUser(req.mysql, uid, (result) => {});
        req.helper.removePostsByAuthorUid(req.mysql, uid, (result) => {});
        req.helper.removeCommentsByAuthorUid(req.mysql, uid, (result) => {});
        req.helper.removeHiddenPostsByUserUid(req.mysql, uid, (result) => {});
        /*req.db.get('users').remove({
            uid: req.session.user.uid
        }).write();
        req.db.get('posts').remove({
            author_uid: req.session.user.uid
        }).write();
        req.db.get('posts').map('comments').remove({
            author_uid: req.session.user.uid
        }).write();*/
    }
    res.redirect('/logout');
};