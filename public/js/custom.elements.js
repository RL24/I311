class Post extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['session-uid', 'uid', 'author-uid', 'author', 'avatar', 'date', 'full-date', 'message', 'display'];
    }

    attributeChangedCallback(name, _old, _new) {
        switch(name) {
            case 'session-uid': this._session_uid = _new; break;
            case 'uid': this._uid = _new; break;
            case 'author-uid': this._author_uid = _new; break;
            case 'author': this._author = _new; break;
            case 'date': this._date = _new; break;
            case 'full-date': this._full_date = _new; break;
            case 'message': this._message = _new; break;
            case 'display': this._display = _new; break;
        }
    }

    connectedCallback() {
        this._updateRendering();
    }

    _updateRendering() {
        var isAuthor = this._author_uid == this._session_uid;

        var current = new Date();
        var date = new Date(this._date);

        var currentDay = current.getDate();
        var currentMonth = current.getMonth();
        var currentYear = current.getFullYear();

        var day = date.getDate();
        var month = date.getMonth();
        var year = date.getFullYear();

        var date_render = this._date;
        if (year == currentYear && month == currentMonth) {
            if (day > currentDay - 1)
                date_render = 'Today';
            else if (day > currentDay - 2)
                date_render = 'Yesterday';
        }

        $.post(`/posts/${this._uid}/comments/get`, (response) => {
            var content = '';
            content+= `
                <div id='${this._uid}' class='row'>
                    <div class='col s12 m8 l6 offset-m2 offset-l3'>
                        <div class='card'>
                            <div class='card-content'>
                                <div class='card-profile-title'>
                                    <div class='row'>
                                        <div class='col s11'>
                                            <div class='left' style='width: 64px; margin-right: 24px;'>
                                                <img src='/images/avatar/${this._author_uid}.png' class='circle responsive-img outlined'/>
                                            </div>
                                            <div>
                                                <p class='grey-text text-darken-4'>${this._author}</p>
                                                <a href='#!' class='tooltipped' data-position='bottom' data-delay='50' data-tooltip='${this._full_date}'><span class='grey-text text-darken-1 ultra-small'>Shared - ${date_render}</span></a>
                                            </div>
                                        </div>
                                        <div class='col s1 right-align'>
                                            <a class='dropdown-button' href='#!' data-activates='postOptions-${this._uid}' data-constrainWidth='false' data-beloworigin='true' data-alignment='right'><i class='material-icons'>expand_more</i></a>
                                            <ul id='postOptions-${this._uid}' class='dropdown-content'>
                                                ${isAuthor ? `
                                                <li><a href='/posts/delete/${this._uid}'>Delete Post</a></li>
                                                <li class='divider'></li>
                                                <li><a href='/posts/display/${this._uid}/${this._display == 'public' ? 'private' : 'public'}'>Make ${this._display == 'public' ? 'Private' : 'Public'}</a></li>
                                                ` : `
                                                <li><a href='/posts/hide/${this._uid}'>Hide Post</a></li>
                                                `}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <p>${this._message}</p>
                            </div>
                            <div class='card-action'>
                                <div class='row no-margin-bottom'>
                                    <div class='col s12 no-padding-hor'>
            `;
            var comments = JSON.parse(response);

            if (comments.length > 0) {
                content+= `<ul id='${this._uid}-comments' class='collection'>`;
                for (var i = 0; i < comments.length; i++) {
                    content+= `
                            <li id='${this._uid}-${comments[i].uid}' class='collection-item no-bottom-border avatar'>
                            </li>
                    `
                    $.post(`/api/user/${comments[i].author_uid}`, (response2) => {
                        i = i - 1;

                        var user = JSON.parse(response2);

                        var commentContent = '';
                        commentContent+= `
                                <img src='/images/avatar/${user.uid}.png' class='circle outlined'>
                                <span class='title'>${user.username}</span>
                                <p>
                                    ${comments[i].message}
                                    <br>
                                    <small><a href='#!' class='tooltipped' data-position='bottom' data-delay='50' data-tooltip='${comments[i].full_date}'><span class='grey-text text-darken-1 ultra-small'>${comments[i].date}</span></a></small>
                                </p>
                        `;
                        $(`#${this._uid}-${comments[i].uid}`).html(commentContent);
                    });
                }
                content+= `</ul>`;
            }

            content+=`
                                    </div>
                                </div>
                                <div class='col s12 no-padding-hor'>
                                    <form action='/posts/${this._uid}/comments/add' method='POST'>
                                        <div class='input-field col s10'>
                                            <input id='${this._uid}-message' name='message' type='text' class='no-margin-bottom'>
                                            <label for='message'>Write a comment</label>
                                        </div>
                                    </form>
                                </div>
                                <div class='clearfix'></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            this.innerHTML = content;
        });
    }
}

customElements.define('udc-post', Post);