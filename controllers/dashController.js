const express = require('express');
const dateformat = require('dateformat');

exports.index = (req, res) => {
    if (req.session.user) {
        req.helper.getUsers(req.mysql, (users) => {
            req.helper.getPosts(req.mysql, (posts) => {
                var authors = [];
                users.forEach((val, ind, arr) => {
                    authors[val.uid] = val;
                });
                res.render('dash', {
                    title: 'Dashboard',
                    has_side_bar: true,
                    session: req.session,
                    posts: posts,
                    authors: authors
                });
            });
        });
    }  else {
        req.session.errors.push('You\'re not logged in');
        res.redirect('/login');
    }
};

exports.create_post = (req, res) => {
    if (req.session.user) {
        req.helper.createOrUpdatePost(req.mysql, req.uuid(), req.session.user.uid, new Date(), req.body.message, req.body.display, (result) => {
            res.redirect('/dashboard');
        });
    } else {
        req.session.errors.push('You\'re not logged in');
        res.redirect('/login');
    }
};