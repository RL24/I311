const express = require('express');

exports.index = (req, res) => {
    if (req.session.user)
        res.render('dash', {
            title: 'Dashboard',
            fluid_nav: true,
            session: req.session
        });
    else
        res.redirect('/');
};