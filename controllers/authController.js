const express = require('express');
const sha1 = require('sha1');
const User = require('../model/user');

exports.index = (req, res) => {
    res.redirect('/login');
};

exports.login = (req, res) => {
    res.render('login', {title: 'Login'});
};

exports.login_post = (req, res) => {
    if (req.session.user)
        res.redirect('/logout');
    else {
        if (req.body.email === process.env.ADMIN_EMAIL && sha1(req.body.password) === process.env.ADMIN_PASSWORD) {
            req.session.user = new User({
                email: req.body.email,
                password: sha1(req.body.password)
            });
            res.redirect('/');
        } else {
            res.redirect('back');
        }
    }
};

exports.register = (req, res) => {
    res.render('register', {title: 'Register'});
};

exports.register_post = (req, res) => {
    res.redirect('/');
};

exports.forgot_password = (req, res) => {
    res.render('forgot_password', {title: 'Forgot Password'});
};

exports.forgot_password_post = (req, res) => {
    res.redirect('/');
};

exports.logout = (req, res) => {
    delete req.session.user;
    res.redirect('/login');
};