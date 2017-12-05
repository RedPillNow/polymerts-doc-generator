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
var Observer = (function (_super) {
    __extends(Observer, _super);
    function Observer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Observer.prototype, "properties", {
        get: function () {
            return this._properties;
        },
        set: function (properties) {
            this._properties = properties;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Observer.prototype, "methodName", {
        get: function () {
            return this._methodName;
        },
        set: function (methodName) {
            this._methodName = methodName;
        },
        enumerable: true,
        configurable: true
    });
    Observer.prototype.toMarkup = function () {
        var comment = this.comment ? this.comment.toMarkup() : '';
        var observerStr = comment;
        observerStr += '\t\t\t\'' + this.methodName + '(';
        for (var i = 0; i < this.properties.length; i++) {
            var prop = this.properties[i];
            observerStr += prop;
            observerStr += (i + 1) < this.properties.length ? ',' : '';
        }
        observerStr += ')\'';
        return observerStr;
    };
    return Observer;
}(program_part_1.ProgramPart));
exports.Observer = Observer;
//# sourceMappingURL=observer.js.map