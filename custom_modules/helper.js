const fs = require('fs');
const request = require('request');

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

exports.getUsers = (con, callback) => {
};