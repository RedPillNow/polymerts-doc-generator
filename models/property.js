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
var Utils = require("../lib/utils");
var program_part_1 = require("./program-part");
var comment_1 = require("./comment");
var comment_2 = require("./comment");
var Property = (function (_super) {
    __extends(Property, _super);
    function Property() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._containsValueArrayLiteral = false;
        _this._containsValueFunction = false;
        _this._containsValueObjectDeclaration = false;
        return _this;
    }
    Object.defineProperty(Property.prototype, "derivedComment", {
        get: function () {
            if (!this.comment || !this.comment.commentText) {
                this.comment = this.comment ? this.comment : new comment_1.Comment();
                var type = this.type || 'Object';
                this.comment.tags = ['@type {' + type + '}'];
                this.comment.isFor = comment_2.ProgramType.Property;
            }
            return this.comment;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Property.prototype, "containsValueArrayLiteral", {
        get: function () {
            return this._containsValueArrayLiteral;
        },
        set: function (containsValueArrayLiteral) {
            this._containsValueArrayLiteral = containsValueArrayLiteral;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Property.prototype, "containsValueFunction", {
        get: function () {
            return this._containsValueFunction;
        },
        set: function (containsValueFunction) {
            this._containsValueFunction = containsValueFunction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Property.prototype, "containsValueObjectDeclaration", {
        get: function () {
            return this._containsValueObjectDeclaration;
        },
        set: function (containsValueObjectDeclaration) {
            this._containsValueObjectDeclaration = containsValueObjectDeclaration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Property.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (name) {
            this._name = name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Property.prototype, "params", {
        get: function () {
            return this._params;
        },
        set: function (params) {
            this._params = params;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Property.prototype, "type", {
        get: function () {
            return this._type;
        },
        set: function (type) {
            this._type = type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Property.prototype, "valueArrayParams", {
        get: function () {
            return this._valueArrayParams;
        },
        set: function (valueArrayParams) {
            this._valueArrayParams = valueArrayParams;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Property.prototype, "valueObjectParams", {
        get: function () {
            return this._valueObjectParams;
        },
        set: function (valueParams) {
            this._valueObjectParams = valueParams;
        },
        enumerable: true,
        configurable: true
    });
    Property.prototype._parseParams = function () {
        var partsArr = this.params ? this.params.split(',') : [];
        var newParamStr = '{\n';
        for (var i = 0; i < partsArr.length; i++) {
            var part = partsArr[i];
            if (this.containsValueFunction && part.indexOf('value:') > -1) {
                newParamStr += this._parseValueFunction(part);
                newParamStr += (i + 1) < partsArr.length ? ',\n' : '\n';
            }
            else if (this.containsValueObjectDeclaration && part.indexOf('value:') > -1) {
                newParamStr += '\t\t\t\t' + this._parseValueObject();
                var valueLen = this.valueObjectParams ? this.valueObjectParams.split(',').length - 1 : 0;
                newParamStr += (i + 1) < (partsArr.length - valueLen) ? ',\n' : '\n';
            }
            else if (this.containsValueArrayLiteral && part.indexOf('value:') > -1) {
                newParamStr += '\t\t\t\t' + this._parseValueArray();
                var valueLen = this.valueArrayParams ? this.valueArrayParams.split(',').length - 1 : 0;
                newParamStr += (i + 1) < (partsArr.length - valueLen) ? ',\n' : '\n';
            }
            else {
                var regEx = /[/{/}\n\t]/g;
                if (part.indexOf('type') > -1) {
                    regEx = /[/{/}\n\t']/g;
                }
                if ((this.containsValueObjectDeclaration || this.containsValueArrayLiteral) && !this._isPartOfValue(part)) {
                    newParamStr += '\t\t\t\t' + part.replace(regEx, '');
                    newParamStr += (i + 1) < partsArr.length ? ',\n' : '\n';
                }
                else if (!this.containsValueObjectDeclaration && !this.containsValueArrayLiteral) {
                    newParamStr += '\t\t\t\t' + part.replace(regEx, '');
                    newParamStr += (i + 1) < partsArr.length ? ',\n' : '\n';
                }
            }
        }
        newParamStr += '\t\t\t}';
        return newParamStr;
    };
    Property.prototype._isPartOfValue = function (part) {
        var partOfValue = false;
        if (part && this.containsValueObjectDeclaration) {
            var valueObj = Utils.getObjectFromString(this.valueObjectParams);
            var partMatch = /(?:^[\{\s"]*([a-zA-Z0-9]+):(?:.)*)/.exec(part);
            if (partMatch) {
                var key = partMatch[1];
                partOfValue = valueObj.hasOwnProperty(key);
            }
        }
        else if (part && this.containsValueArrayLiteral) {
            var valueArr = Utils.getArrayFromString(this.valueArrayParams);
            var partMatch = /(?:['"\s]*([a-zA-Z]*)['"\s]*)/.exec(part);
            if (partMatch && partMatch[1]) {
                var key = partMatch[1];
                partOfValue = valueArr.indexOf(key) > -1;
            }
        }
        return partOfValue;
    };
    Property.prototype._parseValueArray = function () {
        var valueArrStr = 'value: [';
        var arrayParts = this.valueArrayParams.split(',');
        for (var i = 1; i < arrayParts.length; i++) {
            var part = arrayParts[i];
            if (i === 1) {
                valueArrStr += '\n';
            }
            valueArrStr += '\t' + part.replace(/[\]\[\n]/g, '');
            valueArrStr += (i + 1) < arrayParts.length ? ',\n' : '\n';
        }
        if (arrayParts.length > 1) {
            valueArrStr += '\t\t\t\t]';
        }
        else {
            valueArrStr += ']';
        }
        return valueArrStr;
    };
    Property.prototype._parseValueObject = function () {
        var objStr = 'value: {';
        var partsArr = this.valueObjectParams ? this.valueObjectParams.split(',') : [];
        for (var i = 0; i < partsArr.length; i++) {
            var part = partsArr[i];
            if (i === 0) {
                objStr += '\n';
            }
            objStr += '\t\t\t\t\t' + part.replace(/[/{/}\n\t]/g, '');
            objStr += (i + 1) < partsArr.length ? ',\n' : '\n';
        }
        if (partsArr.length > 1) {
            objStr += '\t\t\t\t}';
        }
        else {
            objStr += '}';
        }
        return objStr;
    };
    Property.prototype._parseValueFunction = function (valueFunctionPart) {
        var funcStr = '';
        if (valueFunctionPart) {
            var funcArr_1 = valueFunctionPart.split('\n');
            var idx_1 = 0;
            funcArr_1.forEach(function (element) {
                if ((idx_1 === 0 && element) || (idx_1 === 1 && element)) {
                    funcStr += '\t\t\t' + element.replace(/\n\t/g, '') + '\n';
                }
                else if (idx_1 === funcArr_1.length - 1) {
                    funcStr += '\t' + element.replace(/\n\t/g, '');
                }
                else if (element) {
                    funcStr += '\t' + element.replace(/\n\t/g, '') + '\n';
                }
                idx_1++;
            });
        }
        return funcStr;
    };
    Property.prototype.toMarkup = function () {
        var nameParts = this.name.split(':');
        var comment = this.comment && this.comment.commentText ? '\n' + this.comment.toMarkup() : '\n' + this.derivedComment.toMarkup();
        var propStr = comment;
        propStr += '\t\t\t' + nameParts[0];
        propStr += ': ';
        propStr += this._parseParams();
        return propStr;
    };
    return Property;
}(program_part_1.ProgramPart));
exports.Property = Property;
//# sourceMappingURL=property.js.map