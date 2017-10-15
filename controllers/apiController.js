const express = require('express');

exports.getUserByUid = (req, res) => {
    var uid = req.params.id;
    req.helper.getUserByUid(req.mysql, uid, (user) => {
        if (user == null)
            res.send('{}');
        else
            res.send(JSON.stringify(user));
    });
};