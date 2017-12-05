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
var property_1 = require("./property");
var ComputedProperty = (function (_super) {
    __extends(ComputedProperty, _super);
    function ComputedProperty() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ComputedProperty.prototype, "methodName", {
        get: function () {
            return this._methodName;
        },
        set: function (methodName) {
            this._methodName = methodName;
        },
        enumerable: true,
        configurable: true
    });
    ComputedProperty.prototype._getNewParams = function () {
        var partsArr = this.params ? this.params.split(',') : [];
        var hasType = partsArr.find(function (part) {
            return part.indexOf('type:') > -1;
        });
        if (!hasType) {
            partsArr.unshift('type: Object');
        }
        var newParamStr = '{\n';
        for (var i = 0; i < partsArr.length; i++) {
            var part = partsArr[i];
            newParamStr += '\t\t\t\t' + part.replace(/[/{/}\n\t]/g, '');
            newParamStr += ',\n';
        }
        newParamStr += '\t\t\t\tcomputed: \'' + this.methodName + '\'\n';
        newParamStr += '\t\t\t}';
        return newParamStr;
    };
    ComputedProperty.prototype.toMarkup = function () {
        var nameParts = this.name.split(':');
        var comment = this.comment ? '\n' + this.comment.toMarkup() : '\n';
        var propStr = comment;
        propStr += '\t\t\t' + nameParts[0];
        propStr += ': ';
        propStr += this._getNewParams();
        return propStr;
    };
    return ComputedProperty;
}(property_1.Property));
exports.ComputedProperty = ComputedProperty;
//# sourceMappingURL=computed.js.map