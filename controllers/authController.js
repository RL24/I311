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
    if (req.session.user) {
        req.session.errors.push('You\'re already logged in');
        res.redirect('/dashboard');
    } else
        res.render('login', {title: 'Login'});
};

exports.login_post = (req, res) => {
    if (req.session.user) {
        req.session.errors.push('You\'re already logged in');
        res.redirect('/dashboard');
    } else {
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
                        } else {
                            req.session.errors.push('There was an issue logging in, please try again');
                            res.redirect('back');
                        }
                    });
                    return;
                }
            }
            req.session.errors.push('Invalid username or password');
            res.redirect('back');
        });
    }
};

exports.register = (req, res) => {
    if (req.session.user) {
        req.session.errors.push('You\'re already logged in');
        res.redirect('/dashboard');
    } else
        res.render('register', {title: 'Register'});
};

exports.register_post = (req, res) => {
    if (req.session.user) {
        req.session.errors.push('You\'re already logged in');
        res.redirect('/dashboard');
    } else {
        var email = req.body.email;
        var username = req.body.username;
        var uuid = req.uuid();
        var date = new Date();
        var salt = req.sha1(uuid + date);
        var password = req.sha1(XOR_hex(req.body.password, salt));

        req.helper.getUserByEmailOrUsername(req.mysql, email, (user) => {
            if (user != null) {
                req.session.errors.push('There is already an account with that email or username');
                res.redirect('back');
            } else
                req.helper.createOrUpdateUser(req.mysql, uuid, email, username, password, date, salt, (result) => {
                    req.session.errors.push('Account created');
                    res.redirect('/login');
                });
        });
    }
};

exports.logout = (req, res) => {
    if (req.session.user)
        delete req.session.user;
    req.session.errors.push('Logged out');
    res.redirect('/login');
};

exports.terminate = (req, res) => {
    if (req.session.user) {
        var uid = req.session.user.uid;
        req.helper.removeUser(req.mysql, uid, (result) => {});
        req.helper.removePostsByAuthorUid(req.mysql, uid, (result) => {});
        req.helper.removeCommentsByAuthorUid(req.mysql, uid, (result) => {});
        req.helper.removeHiddenPostsByUserUid(req.mysql, uid, (result) => {});
        req.session.errors.push('Account terminated');
        delete req.session.user;
    }
    res.redirect('/login');
};