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
                    res.redirect('/');
                });
        });

        /*req.session.user.hiddenPosts.push(id);
        req.session.user.hiddenPosts = req.session.user.hiddenPosts.filter((elem, index, self) => {
            return index == self.indexOf(elem);
        });

        var dbo = req.db.get('users').find({
            uid: req.session.user.uid
        });

        if (dbo.value() !== undefined)
            dbo.assign({hiddenPosts: req.session.user.hiddenPosts}).write();*/
    } else
        res.redirect('/');
};

exports.clearHidden = (req, res) => {
    if (req.session.user) {
        var user_uid = req.session.user.uid
        req.helper.removeHiddenPostsByUserUid(req.mysql, user_uid, (result) => {
            if (result)
                req.helper.getHiddenPostsByUserUid(req.mysql, user_uid, (hidden) => {
                    req.session.user.hiddenPosts = hidden;
                    res.redirect('/');
                });
            else
                res.redirect('/');
        });
    }
};

exports.display = (req, res) => {
    var id = req.params.id;
    var display = req.params.display;
    if (req.session.user)
        req.helper.updatePostDisplay(mysql, id, display, (result) => {
            res.redirect('/');
        });
    else
        /*req.db.get('posts')
            .find({ uid: id })
            .assign({ display: display })
            .write();*/
        res.redirect('/');
};

exports.delete = (req, res) => {
    var id = req.params.id;
    if (req.session.user)
        req.helper.removePostByUid(req.mysql, id, (result) => {
            res.redirect('/');
        });
        /*req.db.get('posts')
            .remove({
                uid: id
            })
            .write();*/
    else
        res.redirect('/');
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
        /*var post = req.db.get('posts').find({
            uid: uid
        }).value();

        res.send(JSON.stringify(post.comments));*/
    }
};

exports.addComment = (req, res) => {
    var post_uid = req.params.id;
    if (req.session.user) {
        var comment_uid = req.uuid();
        req.helper.createOrUpdateComment(req.mysql, comment_uid, req.session.user.uid, post_uid, new Date(), req.body.message, (result) => {
            res.redirect(`/dashboard#${post_uid}-message`)
        });

        /*var dboPost = req.db.get('posts').find({
            uid: post_uid
        });
        
        dboPost.get('comments').push({
            uid: req.uuid(),
            author_uid: req.session.user.uid,
            author: req.session.user.username,
            author_avatar: `/images/avatar/${req.session.user.uid}.png`,
            date: dateformat(Date(), 'd mmmm yyyy'),
            full_date: dateformat(Date(), 'dddd, mmmm dS, yyyy, hh:MM TT'),
            comment: req.body.comment
        }).write();*/
    } else
        res.redirect(`/dashboard#${post_uid}-message`);
};