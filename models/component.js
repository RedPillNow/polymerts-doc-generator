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
var fs = require("fs");
var htmlParser = require("htmlparser2");
var program_part_1 = require("./program-part");
var html_comment_1 = require("./html-comment");
var Component = (function (_super) {
    __extends(Component, _super);
    function Component() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Component.prototype, "behaviors", {
        get: function () {
            return this._behaviors || [];
        },
        set: function (behaviors) {
            this._behaviors = behaviors;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "className", {
        get: function () {
            return this._className;
        },
        set: function (className) {
            this._className = className;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "htmlFilePath", {
        get: function () {
            return this._htmlFilePath;
        },
        set: function (htmlFilePath) {
            this._htmlFilePath = htmlFilePath;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "listeners", {
        get: function () {
            return this._listeners || [];
        },
        set: function (listeners) {
            this._listeners = listeners;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "methods", {
        get: function () {
            return this._methods || [];
        },
        set: function (methods) {
            this._methods = methods;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (name) {
            this._name = name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "observers", {
        get: function () {
            return this._observers || [];
        },
        set: function (observers) {
            this._observers = observers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "properties", {
        get: function () {
            return this._properties || [];
        },
        set: function (properties) {
            this._properties = properties;
        },
        enumerable: true,
        configurable: true
    });
    Component.prototype.toMarkup = function () {
        var componentStr = this._writeHtmlComment();
        componentStr += this._writeHead();
        if (this.behaviors && this.behaviors.length > 0) {
            componentStr += this._writeBehaviors();
        }
        if (this.properties && this.properties.length > 0) {
            componentStr += this._writeProperties();
        }
        if (this.observers && this.observers.length > 0) {
            componentStr += this._writeObservers();
        }
        if (this.listeners && this.listeners.length > 0) {
            componentStr += this._writeListeners();
        }
        if (this.observers && this.observers.length > 0) {
        }
        if (this.methods && this.methods.length > 0) {
            componentStr += this._writeMethods();
        }
        componentStr += this._writeFoot();
        return componentStr;
    };
    Component.prototype._writeHtmlComment = function () {
        var comment = null;
        var parser = new htmlParser.Parser({
            oncomment: function (data) {
                if (data.indexOf('@demo') > -1 || data.indexOf('@hero') > -1) {
                    comment = new html_comment_1.HtmlComment();
                    comment.comment = data;
                }
            }
        }, { decodeEntities: true });
        parser.write(fs.readFileSync(this.htmlFilePath));
        parser.end();
        return comment ? comment.toMarkup() : '';
    };
    Component.prototype._writeHead = function () {
        var headStr = '<dom-module id="' + this.name + '">\n';
        headStr += '\t<template>\n';
        headStr += '\t\t<style></style>\n';
        headStr += '\t\t<script>\n';
        headStr += '(function() {\n';
        headStr += '\tPolymer({\n';
        headStr += '\t\tis: \'' + this.name + '\',';
        return headStr;
    };
    Component.prototype._writeFoot = function () {
        var footStr = '\n\t});\n';
        footStr += '})();\n';
        footStr += '\t\t</script>\n';
        footStr += '\t</template>\n';
        footStr += '</dom-module>\n';
        return footStr;
    };
    Component.prototype._writeProperties = function () {
        var propertiesStr = '\n\t\tproperties: {';
        for (var i = 0; i < this.properties.length; i++) {
            var prop = this.properties[i];
            propertiesStr += prop.toMarkup();
            propertiesStr += (i + 1) < this.properties.length ? ',' : '';
        }
        propertiesStr += '\n\t\t},';
        return propertiesStr;
    };
    Component.prototype._writeBehaviors = function () {
        var behaviorsStr = '\n\t\tbehaviors: [\n';
        for (var i = 0; i < this.behaviors.length; i++) {
            var behavior = this.behaviors[i];
            behaviorsStr += '\t\t\t' + behavior.toMarkup();
            behaviorsStr += (i + 1) < this.behaviors.length ? ',\n' : '';
        }
        behaviorsStr += '\n\t\t],';
        return behaviorsStr;
    };
    Component.prototype._writeListeners = function () {
        var listenersStr = '\n\t\tlisteners: {\n';
        for (var i = 0; i < this.listeners.length; i++) {
            var listener = this.listeners[i];
            listenersStr += listener.toMarkup();
            listenersStr += (i + 1) < this.listeners.length ? ',\n' : '';
        }
        listenersStr += '\n\t\t},';
        return listenersStr;
    };
    Component.prototype._writeMethods = function () {
        var methodsStr = '';
        for (var i = 0; i < this.methods.length; i++) {
            var method = this.methods[i];
            methodsStr += '\n' + method.toMarkup();
            methodsStr += (i + 1) < this.methods.length ? ',' : '';
        }
        return methodsStr;
    };
    Component.prototype._writeObservers = function () {
        var observersStr = '\n\t\tobservers: [\n';
        for (var i = 0; i < this.observers.length; i++) {
            var observer = this.observers[i];
            observersStr += observer.toMarkup();
            observersStr += (i + 1) < this.observers.length ? ',\n' : '';
        }
        observersStr += '\n\t\t\],';
        return observersStr;
    };
    return Component;
}(program_part_1.ProgramPart));
exports.Component = Component;
//# sourceMappingURL=component.js.map