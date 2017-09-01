const express = require('express');

exports.index = (req, res) => {
    if (req.session.user)
        res.render('dash', {title: 'Dashboard'});
    else
        res.redirect('/');
}