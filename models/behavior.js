"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var program_part_1 = require("./program-part");
var Behavior = (function (_super) {
    __extends(Behavior, _super);
    function Behavior() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Behavior.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (name) {
            this._name = name;
        },
        enumerable: true,
        configurable: true
    });
    Behavior.prototype.toMarkup = function () {
        var comment = this.comment ? '\n' + this.comment.toMarkup() : '';
        var behaviorStr = comment;
        behaviorStr += this.name;
        return behaviorStr;
    };
    return Behavior;
}(program_part_1.ProgramPart));
exports.Behavior = Behavior;
//# sourceMappingURL=behavior.js.map