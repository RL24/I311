const express = require('express');
const dateformat = require('dateformat');

exports.hide = (req, res) => {
    var post_uid = req.params.id;
    if (req.session.user) {
        var user_uid = req.session.user.uid;
        req.helper.createOrUpdateHiddenPost(req.mysql, user_uid, post_uid, true, (result) => {
            if (result)
                req.helper.getHiddenPostsByUserUid(req.mysql, user_uid, (hidden) => {
                    req.session.user.hiddenPosts = hidden;
                    req.session.errors.push('Post hidden');
                    res.redirect('/dashboard');
                });
        });
    } else {
        req.session.errors.push('You\'re not logged in');
        res.redirect('/login');
    }
};

exports.clearHidden = (req, res) => {
    if (req.session.user) {
        var user_uid = req.session.user.uid
        req.helper.removeHiddenPostsByUserUid(req.mysql, user_uid, (result) => {
            if (result)
                req.helper.getHiddenPostsByUserUid(req.mysql, user_uid, (hidden) => {
                    req.session.user.hiddenPosts = hidden;
                    req.session.errors.push('Cleared all hidden posts');
                    res.redirect('/dashboard');
                });
            else {
                req.session.errors.push('Failed to clear all hidden posts');
                res.redirect('/dashboard');
            }
        });
    } else {
        req.session.errors.push('You\'re not logged in');
        res.redirect('/login');
    }
};

exports.display = (req, res) => {
    var id = req.params.id;
    var display = req.params.display;
    if (req.session.user)
        req.helper.updatePostDisplay(req.mysql, id, display, (result) => {
            req.session.errors.push(`Post ${(display == 'private' ? 'privated' : 'publicized')}`);
            res.redirect('/dashboard');
        });
     else {
        req.session.errors.push('You\'re not logged in');
        res.redirect('/');
    }
};

exports.delete = (req, res) => {
    var id = req.params.id;
    if (req.session.user)
        req.helper.removePostByUid(req.mysql, id, (result) => {
            req.session.errors.push('Removed post');
            res.redirect('/dashboard');
        });
    else {
        req.session.errors.push('You\'re not logged in');
        res.redirect('/login');
    }
};

exports.getComments = (req, res) => {
    if (req.session.user) {
        var uid = req.params.id;
        req.helper.getCommentsByPostUid(req.mysql, uid, (comments) => {
            if (comments == null)
                res.send('[]');
            else
                res.send(JSON.stringify(comments));
        });
    } else {
        req.session.errors.push('You\'re not logged in');
        res.redirect('/login');
    }
};

exports.addComment = (req, res) => {
    var post_uid = req.params.id;
    if (req.session.user) {
        var comment_uid = req.uuid();
        req.helper.createOrUpdateComment(req.mysql, comment_uid, req.session.user.uid, req.session.user.username, post_uid, new Date(), req.body.message, (result) => {
            res.redirect(`/dashboard#${post_uid}-message`)
        });
    } else {
        req.session.errors.push('You\'re not logged in');
        res.redirect(`/login`);
    }
};