const express = require('express');
const db = require('mysql');

exports.index = (req, res) => {
    var connection = db.createConnection({
        host: '1599116',
        user: 'feign',
        password: '1599116',
        database: 'users'
    });

    connection.query('SELECT * FROM users', (err, rows, fields) => {
        if (err)
            res.send(err);
        else
            res.send(rows);
    });

    /*if (req.session.user)
        res.render('dash', {title: 'Dashboard'});
    else
        res.redirect('/');*/

    connection.end();
}