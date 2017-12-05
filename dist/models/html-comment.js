"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HtmlComment = (function () {
    function HtmlComment() {
    }
    Object.defineProperty(HtmlComment.prototype, "comment", {
        get: function () {
            return this._comment;
        },
        set: function (comment) {
            this._comment = comment;
        },
        enumerable: true,
        configurable: true
    });
    HtmlComment.prototype.toMarkup = function () {
        var commentStr = null;
        if (this.comment) {
            commentStr = '<!--\n';
            commentStr += this.comment;
            commentStr += '\n-->\n';
        }
        return commentStr;
    };
    return HtmlComment;
}());
exports.HtmlComment = HtmlComment;
//# sourceMappingURL=html-comment.js.map