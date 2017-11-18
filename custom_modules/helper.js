const fs = require('fs');
const request = require('request');
const dateformat = require('dateformat');

download = (uri, filename, callback) => {
    request.head(uri, (err, res, body) => {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

exports.setDatabaseHelpers = (db) => {
    db._.mixin({
        findUser: (array, input) => {
            var _in = input.toLowerCase();
            for (var i = 0; i < array.length; i++)
                if (array[i].username.toLowerCase() == _in || array[i].email.toLowerCase() == _in || array[i].uid.toLowerCase() == _in)
                    return array[i];
            return null;
        }
    });
};

exports.getAvatar = (uid, req, res) => {
    download(`https://robohash.org/${uid}`, `./public/images/avatar/${uid}.png`, () => {
        res.redirect('/');
    });
};

exports.getUsers = (mysql, callback) => {
    mysql.query('SELECT * FROM user', (err, rows, fields) => {
        if (err) throw err;
        callback(rows);
    });
};

exports.getUserByUid = (mysql, uid, callback) => {
    mysql.query(`SELECT * FROM user WHERE uid = ?`, [uid], (err, rows, fields) => {
        if (err) throw err;
        callback(rows[0]);
    });
};

exports.getUserByEmailOrUsername = (mysql, login, callback) => {
    mysql.query(`SELECT * FROM user WHERE email = ? OR username = ?`, [login, login], (err, rows, fields) => {
        if (err) throw err;
        callback(rows[0]);
    });
};

exports.createOrUpdateUser = (mysql, uid, email, username, password, last_login, salt, callback) => {
    module.exports.getUserByUid(mysql, uid, (user) => {
        if (user != null)
            mysql.query(`UPDATE user SET email = ?, username = ?, password = ?, last_login = ?, salt = ? WHERE uid = ?`, [email, username, password, last_login, salt, uid], (err, rows, fields) => {
                if (err) throw err;
                callback(true);
            });
        else
            mysql.query(`INSERT INTO user VALUES (?, ?, ?, ?, ?, ?)`, [uid, email, username, password, last_login, salt], (err, rows, fields) => {
                if (err) throw err;
                callback(true);
            });
    });
};

exports.removeUser = (mysql, uid, callback) => {
    mysql.query(`DELETE FROM user WHERE uid = ?`, [uid], (err, rows, fields) => {
        if (err) throw err;
        callback(true);
    });
};

exports.getPosts = (mysql, callback) => {
    mysql.query('SELECT * FROM post ORDER BY created DESC', (err, rows, fields) => {
        if (err) throw err;
        callback(rows);
    })
};

exports.getPostsByAuthorUid = (mysql, author_uid, callback) => {
    mysql.query(`SELECT uid FROM post WHERE author_uid = ?`, [author_uid], (err, rows, fields) => {
        if (err) throw err;
        callback(rows.map((val, ind, arr) => {
            return val.uid;
        }));
    });
};

exports.getPostByUid = (mysql, author_uid, uid, callback) => {
    mysql.query(`SELECT * FROM post WHERE author_uid = ? AND uid = ?`, [author_uid, uid], (err, rows, fields) => {
        if (err) throw err;
        callback(rows[0]);
    });
};

exports.createOrUpdatePost = (mysql, uid, author_uid, date, message, display, callback) => {
    var created = date.getTime();
    var full_date = dateformat(date, 'dddd, mmmm dS, yyyy, hh:MM TT');
    date = dateformat(date, 'd mmmm yyyy');
    module.exports.getPostByUid(mysql, author_uid, uid, (post) => {
        if (post != null)
            mysql.query(`UPDATE post SET author_uid = ?, date = ?, full_date = ?, message = ?, display = ? WHERE uid = ?`, [author_uid, date, full_date, message, display, uid], (err, rows, fields) => {
                if (err) throw err;
                callback(true);
            });
        else
            mysql.query(`INSERT INTO post VALUES (?, ?, ?, ?, ?, ?, ?)`, [uid, author_uid, date, full_date, message, display, created], (err, rows, fields) => {
                if (err) throw err;
                callback(false);
            });
    });
};

exports.updatePostDisplay = (mysql, uid, display, callback) => {
    mysql.query(`UPDATE post SET display = ? WHERE uid = ?`, [display, uid], (err, rows, fields) => {
        if (err) throw err;
        callback(true);
    });
};

exports.removePostByUid = (mysql, uid, callback) => {
    mysql.query(`DELETE FROM post WHERE uid = ?`, [uid], (err, rows, fields) => {
        if (err) throw err;
        module.exports.removeCommentsByPostUid(mysql, uid, (result) => {
            callback(result);
        });
    });
};

exports.removePostsByAuthorUid = (mysql, author_uid, callback) => {
    mysql.query(`DELETE FROM post WHERE author_uid = ?`, [author_uid], (err, rows, fields) => {
        if (err) throw err;
        callback(true);
    });
};

exports.getHiddenPostsByUserUid = (mysql, user_uid, callback) => {
    mysql.query(`SELECT post_uid FROM hidden WHERE user_uid = ?`, [user_uid], (err, rows, fields) => {
        if (err) throw err;
        callback(rows.map((val, ind, arr) => {
            return val.post_uid;
        }));
    });
};

exports.getHiddenPost = (mysql, user_uid, post_uid, callback) => {
    mysql.query(`SELECT * FROM hidden WHERE user_uid = ? AND post_uid = ?`, [user_uid, post_uid], (err, rows, fields) => {
        if (err) throw err;
        callback(rows[0]);
    });
};

exports.createOrUpdateHiddenPost = (mysql, user_uid, post_uid, hide, callback) => {
    module.exports.getHiddenPost(mysql, user_uid, post_uid, (result) => {
        if (result != null && !hide)
            mysql.query(`DELETE FROM hidden WHERE user_uid = ? AND post_uid = ?`, [user_uid, post_uid], (err, rows, fields) => {
                if (err) throw err;
                callback(true);
            });
        else if (!result && hide)
            mysql.query(`INSERT INTO hidden VALUES (?, ?)`, [user_uid, post_uid], (err, rows, fields) => {
                if (err) throw err;
                callback(true);
            });
    });
};

exports.removeHiddenPostsByUserUid = (mysql, user_uid, callback) => {
    mysql.query(`DELETE FROM hidden WHERE user_uid = ?`, [user_uid], (err, rows, fields) => {
        if (err) throw err;
        callback(true);
    });
};

exports.getComments = (mysql, post_uid, callback) => {
    mysql.query(`SELECT uid FROM comment WHERE post_uid = ? ORDER BY created ASC`, [post_uid], (err, rows, fields) => {
        if (err) throw err;
        callback(rows.map((val, ind, arr) => {
            return val.uid;
        }));
    });
};

exports.getCommentByUid = (mysql, post_uid, uid, callback) => {
    mysql.query(`SELECT * FROM comment WHERE post_uid = ? AND uid = ?`, [post_uid, uid], (err, rows, fields) => {
        if (err) throw err;
        callback(rows[0]);
    });
};

exports.getCommentsByPostUid = (mysql, post_uid, callback) => {
    mysql.query(`SELECT * FROM comment WHERE post_uid = ? ORDER BY created ASC`, [post_uid], (err, rows, fields) => {
        if (err) throw err;
        callback(rows);
    });
};

exports.getCommentsByAuthorUid = (mysql, author_uid, callback) => {
    mysql.query(`SELECT uid FROM comment WHERE author_uid = ? ORDER BY created DESC`, [author_uid], (err, rows, fields) => {
        if (err) throw err;
        callback(rows.map((val, ind, arr) => {
            return val.uid;
        }));
    });
};

exports.createOrUpdateComment = (mysql, uid, author_uid, author_name, post_uid, date, message, callback) => {
    var created = date.getTime();
    var full_date = dateformat(date, 'dddd, mmmm dS, yyyy, hh:MM TT');
    date = dateformat(date, 'd mmmm yyyy');
    module.exports.getCommentByUid(mysql, post_uid, uid, (comment) => {
        if (comment != null)
            mysql.query(`UPDATE comment SET author_uid = ?, author_name = ?, post_uid = ?, date = ?, full_date = ?, message = ? WHERE uid = ?`, [author_uid, author_name, post_uid, date, full_date, message, uid], (err, rows, fields) => {
                if (err) throw err;
                callback(true);
            });
        else
            mysql.query(`INSERT INTO comment VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [uid, author_uid, author_name, post_uid, date, full_date, message, created], (err, rows, fields) => {
                if (err) throw err;
                callback(false);
            });
    });
}

exports.removeCommentByUid = (mysql, uid, callback) => {
    mysql.query(`DELETE FROM comment WHERE uid = ?`, [uid], (err, rows, fields) => {
        if (err) throw err;
        callback(true);
    });
};

exports.removeCommentsByAuthorUid = (mysql, author_uid, callback) => {
    mysql.query(`DELETE FROM comment WHERE author_uid = ?`, [author_uid], (err, rows, fields) => {
        if (err) throw err;
        callback(true);
    });
};

exports.removeCommentsByPostUid = (mysql, post_uid, callback) => {
    mysql.query(`DELETE FROM comment WHERE post_uid = ?`, [post_uid], (err, rows, fields) => {
        if (err) throw err;
        callback(true);
    });
};