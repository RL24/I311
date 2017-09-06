const express = require('express');

exports.add = (req, res) => {
    if (!req.session.user) {
        res.redirect('/');
        return;
    }
    res.render('contact/add', {
        title: 'Add Contact',
        fluid_nav: true,
        session: req.session
    });
};

exports.add_post = (req, res) => {
    if (req.session.user) {
        req.session.user.contacts.push({
            uid: req.uuid(),
            name: req.body.name,
            email: req.body.email,
        });

        var dbo = req.db.get('users').find({
            uid: req.session.user.uid
        });

        if (dbo.value() !== undefined)
            dbo.assign({contacts: req.session.user.contacts}).write();
    }
    res.redirect('/');
};

exports.remove = (req, res) => {
    if (req.session.user) {
        for (var i = 0; i < req.session.user.contacts.length; i++)
            if (req.session.user.contacts[i].uid == req.params.id)
                req.session.user.contacts.splice(i, 1);

        var dbo = req.db.get('users').find({
            uid: req.session.user.uid
        });

        if (dbo.value() !== undefined)
            dbo.assign({contacts: req.session.user.contacts}).write();
    }
    res.redirect('/');
};