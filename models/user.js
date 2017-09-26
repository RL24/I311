function User(uid, email, username, hiddenPosts) {
    this.uid = uid;
    this.email = email;
    this.username = username;
    this.hiddenPosts = hiddenPosts;
}

module.exports = User;