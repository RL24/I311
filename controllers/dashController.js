const express = require('express');
const dateformat = require('dateformat');

exports.index = (req, res) => {
    if (req.session.user) {
        var dboAuthors = req.db.get('users').value();
        var authors = [];
        dboAuthors.forEach((item, index, arr) => {
            authors[item.uid] = item;
        });
        res.render('dash', {
            title: 'Dashboard',
            fluid_nav: true,
            session: req.session,
            posts: req.db.get('posts').value(),
            authors: authors
        });
    } else
        res.redirect('/');
};

exports.create_post = (req, res) => {
    if (req.session.user) {
        req.db.get('posts').push({
            uid: req.uuid(),
            author_uid: req.session.user.uid,
            date: dateformat(Date(), 'd mmmm yyyy'),
            full_date: dateformat(Date(), 'dddd, mmmm dS, yyyy, hh:MM TT'),
            message: req.body.message,
            display: req.body.display,
            comments: []
        }).write();
    }
    res.redirect('/');
};