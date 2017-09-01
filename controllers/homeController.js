const express = require('express');

exports.index = (req, res) => {
    if (req.session.user)
        res.redirect('/dashboard');
    else
        res.redirect('/login');
};