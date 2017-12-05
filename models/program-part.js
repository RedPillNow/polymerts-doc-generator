"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var comment_1 = require("./comment");
var ProgramPart = (function () {
    function ProgramPart() {
    }
    Object.defineProperty(ProgramPart.prototype, "comment", {
        get: function () {
            if (this._comment === undefined && this.tsNode) {
                var tsNodeAny = this.tsNode;
                if (tsNodeAny.jsDoc && tsNodeAny.jsDoc.length > 0) {
                    var comm = new comment_1.Comment();
                    comm.commentText = tsNodeAny.jsDoc[0].comment;
                    if (tsNodeAny.jsDoc[0].tags && tsNodeAny.jsDoc[0].tags.length > 0) {
                        var tags = [];
                        for (var i = 0; i < tsNodeAny.jsDoc[0].tags.length; i++) {
                            var tag = tsNodeAny.jsDoc[0].tags[i];
                            var tagName = '@' + tag.tagName.text;
                            var tagNameType = tag.typeExpression ? tag.typeExpression.getText() : tag.comment;
                            var tagTextName = tag.name ? tag.name.getText() : '';
                            var tagComment = tag.comment ? tag.comment : '';
                            tagName += ' ' + tagNameType;
                            tagName += ' ' + tagTextName;
                            if (tag.comment !== tagNameType) {
                                tagName += ' ' + tagComment;
                            }
                            tags.push(tagName);
                        }
                        comm.tags = tags;
                    }
                    this._comment = comm;
                }
            }
            return this._comment;
        },
        set: function (comment) {
            this._comment = comment;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProgramPart.prototype, "endLineNum", {
        get: function () {
            return this._endLineNum;
        },
        set: function (endLineNum) {
            this._endLineNum = endLineNum;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProgramPart.prototype, "startLineNum", {
        get: function () {
            return this._startLineNum;
        },
        set: function (startLineNum) {
            this._startLineNum = startLineNum;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProgramPart.prototype, "tsNode", {
        get: function () {
            return this._tsNode;
        },
        set: function (tsNode) {
            this._tsNode = tsNode;
        },
        enumerable: true,
        configurable: true
    });
    return ProgramPart;
}());
exports.ProgramPart = ProgramPart;
//# sourceMappingURL=program-part.js.map