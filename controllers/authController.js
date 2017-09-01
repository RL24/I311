const express = require('express');
const sha1 = require('sha1');
const User = require('../model/user');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

exports.index = (req, res) => {
    res.redirect('/login');
};

exports.login = (req, res) => {
    res.render('login', {title: 'Login'});
};

exports.login_post = (req, res) => {
    if (req.session.user) {
        console.log('Already logged in, returning to previous page');
        res.redirect('back');
    } else {
        console.log('Authenticating user');
        
        var matches = db.get('users').find({
            email: req.body.email,
            password: sha1(req.body.password)
        }).value();

        if (matches !== undefined) {
            console.log('Logging in as admin');
            req.session.user = new User({
                email: req.body.email,
                password: sha1(req.body.password)
            });
            res.redirect('/');
        } else {
            console.log('Failed to authenticate user');
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