const express = require('express');
const dateformat = require('dateformat');

exports.hide = (req, res) => {
    var id = req.params.id;
    if (req.session.user) {
        req.session.user.hiddenPosts.push(id);
        req.session.user.hiddenPosts = req.session.user.hiddenPosts.filter((elem, index, self) => {
            return index == self.indexOf(elem);
        });

        var dbo = req.db.get('users').find({
            uid: req.session.user.uid
        });

        if (dbo.value() !== undefined)
            dbo.assign({hiddenPosts: req.session.user.hiddenPosts}).write();
    }
    res.redirect('/');
};

exports.display = (req, res) => {
    var id = req.params.id;
    var display = req.params.display;
    if (req.session.user)
        req.db.get('posts')
            .find({ uid: id })
            .assign({ display: display })
            .write();
    res.redirect('/');
};

exports.delete = (req, res) => {
    var id = req.params.id;
    if (req.session.user) {
        req.db.get('posts')
            .remove({
                uid: id
            })
            .write();
    }
    res.redirect('/');
};