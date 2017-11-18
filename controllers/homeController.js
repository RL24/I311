const express = require('express');

exports.index = (req, res) => {
    if (req.session.user)
        res.redirect('/dashboard');
    else
        res.redirect('/login');
};

exports.help_user = (req, res) => {
    res.render('help_user', {title: 'User Help'});
};

exports.help_dev = (req, res) => {
    res.render('help_dev', {title: 'Developer Help'});
};