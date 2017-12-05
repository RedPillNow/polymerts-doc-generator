"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProgramType;
(function (ProgramType) {
    ProgramType["Property"] = "PROPERTY";
    ProgramType["Computed"] = "COMPUTED";
    ProgramType["Component"] = "COMPONENT";
    ProgramType["Behavior"] = "BEHAVIOR";
    ProgramType["Listener"] = "LISTENER";
    ProgramType["Observer"] = "OBSERVER";
    ProgramType["Function"] = "FUNCTION";
})(ProgramType = exports.ProgramType || (exports.ProgramType = {}));
var Comment = (function () {
    function Comment() {
    }
    Object.defineProperty(Comment.prototype, "commentObj", {
        get: function () {
            return this._commentObj;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Comment.prototype, "commentText", {
        get: function () {
            if (!this._commentText && this.commentObj) {
                this._commentText = this.commentObj.content;
            }
            return this._commentText;
        },
        set: function (commentText) {
            this._commentText = commentText;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Comment.prototype, "endLineNum", {
        get: function () {
            return this._endLineNum;
        },
        set: function (endLineNum) {
            this._endLineNum = endLineNum;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Comment.prototype, "isFor", {
        get: function () {
            return this._isFor;
        },
        set: function (isFor) {
            this._isFor = isFor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Comment.prototype, "startLineNum", {
        get: function () {
            return this._startLineNum;
        },
        set: function (startLineNum) {
            this._startLineNum = startLineNum;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Comment.prototype, "tags", {
        get: function () {
            return this._tags || [];
        },
        set: function (tags) {
            this._tags = tags;
        },
        enumerable: true,
        configurable: true
    });
    Comment.prototype._getIndent = function () {
        var indentation = '\t\t\t';
        switch (this.isFor) {
            case ProgramType.Property:
                indentation = '\t\t\t';
                break;
            case ProgramType.Function:
                indentation = '\t\t';
                break;
            case ProgramType.Component:
                indentation = '\t';
                break;
            case ProgramType.Listener:
                indentation = '\t\t\t';
                break;
            case ProgramType.Behavior:
                indentation = '\t\t\t';
                break;
            case ProgramType.Computed:
                indentation = '\t\t\t';
                break;
            case ProgramType.Observer:
                indentation = '\t\t\t';
                break;
        }
        return indentation;
    };
    Comment.prototype.toMarkup = function () {
        var markup = this._getIndent() + '/**\n';
        markup += this._getIndent() + ' * ';
        markup += this.commentText ? this.commentText.replace(/\n/g, '\n' + this._getIndent() + ' * ') + '\n' : '\n';
        for (var i = 0; i < this.tags.length; i++) {
            var tag = this.tags[i];
            markup += this._getIndent() + ' * ' + tag + '\n';
        }
        markup += this._getIndent() + ' */\n';
        if (!this.commentText && (!this.tags || this.tags.length === 0)) {
            markup = '';
        }
        return markup;
    };
    return Comment;
}());
exports.Comment = Comment;
//# sourceMappingURL=comment.js.map