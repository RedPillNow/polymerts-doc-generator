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
var Listener = (function (_super) {
    __extends(Listener, _super);
    function Listener() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._isExpression = false;
        return _this;
    }
    Object.defineProperty(Listener.prototype, "elementId", {
        get: function () {
            return this._elementId;
        },
        set: function (elementId) {
            this._elementId = elementId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Listener.prototype, "eventDeclaration", {
        get: function () {
            return this._eventDeclaration;
        },
        set: function (eventDeclaration) {
            this._eventDeclaration = eventDeclaration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Listener.prototype, "eventName", {
        get: function () {
            return this._eventName;
        },
        set: function (name) {
            this._eventName = name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Listener.prototype, "isExpression", {
        get: function () {
            return this._isExpression;
        },
        set: function (isExpression) {
            this._isExpression = isExpression;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Listener.prototype, "methodName", {
        get: function () {
            return this._methodName;
        },
        set: function (methodName) {
            this._methodName = methodName;
        },
        enumerable: true,
        configurable: true
    });
    Listener.prototype.toMarkup = function () {
        var comment = this.comment ? this.comment.toMarkup() : '';
        var listenerStr = comment;
        var eventName = this.eventDeclaration ? this.eventDeclaration.replace(/['"]/g, '') : '';
        listenerStr += '\t\t\t\'' + eventName + '\'';
        listenerStr += ': ';
        listenerStr += '\'' + this.methodName + '\'';
        return listenerStr;
    };
    return Listener;
}(program_part_1.ProgramPart));
exports.Listener = Listener;
//# sourceMappingURL=listener.js.map