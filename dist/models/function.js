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
var Function = (function (_super) {
    __extends(Function, _super);
    function Function() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Function.prototype, "methodName", {
        get: function () {
            return this._methodName;
        },
        set: function (methodName) {
            this._methodName = methodName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Function.prototype, "parameters", {
        get: function () {
            return this._parameters || [];
        },
        set: function (parameters) {
            this._parameters = parameters || [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Function.prototype, "returnType", {
        get: function () {
            return this._returnType;
        },
        set: function (returnType) {
            this._returnType = returnType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Function.prototype, "signature", {
        get: function () {
            if (!this._signature && this.methodName && this.parameters) {
                this._signature = this.methodName + '(';
                for (var i = 0; i < this.parameters.length; i++) {
                    this._signature += this.parameters[i];
                    this._signature += (i + 1) < this.parameters.length ? ', ' : '';
                }
                this._signature += ') {}';
            }
            return this._signature;
        },
        set: function (signature) {
            this._signature = signature;
        },
        enumerable: true,
        configurable: true
    });
    Function.prototype.toMarkup = function () {
        var comment = this.comment ? this.comment.toMarkup() : '';
        var functionStr = comment;
        functionStr += '\t\t' + this.signature;
        return functionStr;
    };
    return Function;
}(program_part_1.ProgramPart));
exports.Function = Function;
//# sourceMappingURL=function.js.map