"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var ts = require("typescript");
var Utils = require("./lib/utils");
var behavior_1 = require("./models/behavior");
var component_1 = require("./models/component");
var computed_1 = require("./models/computed");
var function_1 = require("./models/function");
var listener_1 = require("./models/listener");
var observer_1 = require("./models/observer");
var property_1 = require("./models/property");
var comment_1 = require("./models/comment");
var component = new component_1.Component();
exports.component = component;
var _behaviors = [];
var _functions = [];
var _listeners = [];
var _observers = [];
var _properties = [];
var options = null;
function reset() {
    component = new component_1.Component();
    _behaviors = [];
    _functions = [];
    _listeners = [];
    _observers = [];
    _properties = [];
}
exports.reset = reset;
function start(options, fileName, docPath) {
    this.options = options || {};
    var pathInfo = Utils.getPathInfo(fileName, docPath);
    component.htmlFilePath = pathInfo.fullHtmlFilePath;
    var sourceFile = ts.createSourceFile(pathInfo.fileName, fs.readFileSync(pathInfo.fileName).toString(), ts.ScriptTarget.ES2015, true);
    parseTs(sourceFile);
    _writeDocumentation(pathInfo, component);
    return pathInfo.fullDocFilePath;
}
exports.start = start;
function parseTs(sourceFile) {
    var nodes = 0;
    var parseNode = function (node) {
        switch (node.kind) {
            case ts.SyntaxKind.ClassDeclaration:
                if (node.decorators && node.decorators.length > 0) {
                    _initComponent(node);
                }
                break;
            case ts.SyntaxKind.PropertyDeclaration:
                _getProperty(node);
                break;
            case ts.SyntaxKind.MethodDeclaration:
                _getMethod(node);
                break;
        }
        ;
        nodes++;
        ts.forEachChild(node, parseNode);
    };
    parseNode(sourceFile);
    component.behaviors = _behaviors;
    component.methods = _functions;
    component.listeners = _listeners;
    component.observers = _observers;
    component.properties = _properties;
    return component;
}
exports.parseTs = parseTs;
function _initComponent(node) {
    if (node && node.decorators && node.decorators.length > 0) {
        var clazz = node;
        component.tsNode = node;
        component.className = clazz.name.getText();
        component.startLineNum = Utils.getStartLineNumber(node);
        component.endLineNum = Utils.getEndLineNumber(node);
        component.comment ? component.comment.isFor = comment_1.ProgramType.Component : null;
        if (node.decorators && node.decorators.length > 0) {
            node.decorators.forEach(function (decorator) {
                var exp = decorator.expression;
                var expText = exp.getText();
                var componentMatch = /\s*(?:component)\s*\((?:['"]{1}(.*)['"]{1})\)/.exec(exp.getText());
                var behaviorMatch = /\s*(?:behavior)\s*\((...*)\)/.exec(exp.getText());
                if (componentMatch && componentMatch.length > 0) {
                    component.name = componentMatch[1];
                }
                else if (behaviorMatch && behaviorMatch.length > 0) {
                    var behave = new behavior_1.Behavior();
                    behave.tsNode = decorator;
                    behave.startLineNum = Utils.getStartLineNumber(decorator);
                    behave.endLineNum = Utils.getEndLineNumber(decorator);
                    behave.name = behaviorMatch[1];
                    _behaviors.push(behave);
                }
            });
        }
    }
    return component;
}
function _getProperty(node) {
    if (node && node.kind === ts.SyntaxKind.PropertyDeclaration) {
        var tsProp = node;
        var isInComponent = Utils.isNodeComponentChild(tsProp.parent, component);
        var insideProperty_1 = false;
        if (isInComponent && tsProp.decorators && tsProp.decorators.length > 0) {
            var prop_1 = new property_1.Property();
            prop_1.tsNode = node;
            prop_1.startLineNum = Utils.getStartLineNumber(node);
            prop_1.endLineNum = Utils.getEndLineNumber(node);
            prop_1.name = tsProp.name.getText();
            prop_1.comment ? prop_1.comment.isFor = comment_1.ProgramType.Property : null;
            var parseChildren_1 = function (childNode) {
                if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression) {
                    var objExp = childNode;
                    if (!insideProperty_1) {
                        var objLiteralObj = Utils.getObjectLiteralString(objExp);
                        prop_1.params = objLiteralObj.str;
                        prop_1.type = objLiteralObj.type;
                        insideProperty_1 = true;
                    }
                    else {
                        prop_1.containsValueObjectDeclaration = true;
                        prop_1.valueObjectParams = Utils.getObjectLiteralString(objExp).str;
                    }
                }
                else if (childNode.kind === ts.SyntaxKind.ArrowFunction) {
                    prop_1.containsValueFunction = true;
                }
                else if (childNode.kind === ts.SyntaxKind.FunctionExpression) {
                    prop_1.containsValueFunction = true;
                }
                else if (childNode.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                    var arrayLiteral = childNode;
                    prop_1.containsValueArrayLiteral = true;
                    prop_1.valueArrayParams = arrayLiteral.getText();
                }
                ts.forEachChild(childNode, parseChildren_1);
            };
            parseChildren_1(tsProp);
            _properties.push(prop_1);
        }
    }
}
function _getMethod(node) {
    if (node && node.kind === ts.SyntaxKind.MethodDeclaration) {
        var method = node;
        if (Utils.isComputedProperty(method)) {
            var computed = _getComputedProperty(method);
            if (computed) {
                var computedMethod = Utils.getMethodFromComputed(computed);
                _functions.push(computedMethod);
                _properties.push(computed);
            }
        }
        else if (Utils.isListener(method)) {
            var listener = _getListener(method);
            if (listener) {
                if (listener.methodName) {
                    var listenerMethod = Utils.getMethodFromListener(listener);
                    _functions.push(listenerMethod);
                }
                _listeners.push(listener);
            }
        }
        else if (Utils.isObserver(method)) {
            var observer = _getObserver(method);
            if (observer) {
                var observerMethod = Utils.getMethodFromObserver(observer);
                _functions.push(observerMethod);
                if ((observer.properties && observer.properties.length === 1) && observer.properties[0].indexOf('.') === -1) {
                    var property = findProperty(observer.properties[0]);
                    try {
                        var propertyParamObj = Utils.getObjectFromString(property.params);
                        propertyParamObj.observer = observer.methodName;
                        property.params = Utils.getStringFromObject(propertyParamObj);
                    }
                    catch (e) {
                        throw new Error('Property: \'' + observer.properties[0] + '\' for observer method \'' + observerMethod.methodName + '\' is not defined as a property on the component');
                    }
                }
                else {
                    _observers.push(observer);
                }
            }
        }
        else {
            var func = _getFunction(method);
            if (func) {
                _functions.push(func);
            }
        }
    }
}
function _getComputedProperty(node) {
    if (node) {
        var computed_2 = new computed_1.ComputedProperty();
        computed_2.tsNode = node;
        computed_2.name = node.name.getText();
        computed_2.methodName = '_get' + Utils.capitalizeFirstLetter(node.name.getText().replace(/_/g, ''));
        computed_2.startLineNum = Utils.getStartLineNumber(node);
        computed_2.endLineNum = Utils.getEndLineNumber(node);
        computed_2.comment ? computed_2.comment.isFor = comment_1.ProgramType.Computed : null;
        var parseChildren_2 = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression) {
                var objExp = childNode;
                var objLitObj = Utils.getObjectLiteralString(objExp);
                computed_2.params = objLitObj.str;
                computed_2.type = objLitObj.type;
            }
            ts.forEachChild(childNode, parseChildren_2);
        };
        parseChildren_2(node);
        return computed_2;
    }
    return null;
}
function _getListener(node) {
    if (node) {
        var listener_2 = new listener_1.Listener();
        listener_2.tsNode = node;
        listener_2.methodName = node.name.getText();
        listener_2.startLineNum = Utils.getStartLineNumber(node);
        listener_2.endLineNum = Utils.getEndLineNumber(node);
        listener_2.comment ? listener_2.comment.isFor = comment_1.ProgramType.Listener : null;
        if (node.decorators && node.decorators.length > 0) {
            node.decorators.forEach(function (decorator, idx) {
                var parseChildren = function (decoratorChildNode) {
                    var kindStr = ts.SyntaxKind[decoratorChildNode.kind] + '=' + decoratorChildNode.kind;
                    switch (decoratorChildNode.kind) {
                        case ts.SyntaxKind.StringLiteral:
                            var listenerStrNode = decoratorChildNode;
                            listener_2.eventDeclaration = listenerStrNode.getText();
                            break;
                        case ts.SyntaxKind.PropertyAccessExpression:
                            var listenerPropAccExp = decoratorChildNode;
                            listener_2.eventDeclaration = listenerPropAccExp.getText();
                            listener_2.isExpression = true;
                            break;
                    }
                    ;
                    ts.forEachChild(decoratorChildNode, parseChildren);
                };
                parseChildren(decorator);
            });
        }
        var sigArr = listener_2.eventDeclaration ? listener_2.eventDeclaration.split('.') : [];
        listener_2.eventName = sigArr[1] || null;
        listener_2.elementId = listener_2.eventName ? sigArr[0] : null;
        return listener_2;
    }
    return null;
}
function _getObserver(node) {
    if (node) {
        var observer_2 = new observer_1.Observer();
        observer_2.tsNode = node;
        observer_2.startLineNum = Utils.getStartLineNumber(node);
        observer_2.endLineNum = Utils.getEndLineNumber(node);
        observer_2.methodName = node.name.getText();
        observer_2.comment ? observer_2.comment.isFor = comment_1.ProgramType.Observer : null;
        if (node.decorators && node.decorators.length > 0) {
            node.decorators.forEach(function (decorator, idx) {
                var parseChildren = function (decoratorChildNode) {
                    if (decoratorChildNode.kind === ts.SyntaxKind.StringLiteral) {
                        var observerStrNode = decoratorChildNode;
                        var propsStr = observerStrNode.getText();
                        propsStr = propsStr.replace(/[\s']*/g, '');
                        observer_2.properties = propsStr.split(',');
                    }
                    ts.forEachChild(decoratorChildNode, parseChildren);
                };
                parseChildren(decorator);
            });
        }
        return observer_2;
    }
    return null;
}
function _getFunction(node) {
    if (node) {
        var func = new function_1.Function();
        func.tsNode = node;
        func.methodName = node.name.getText();
        ;
        func.startLineNum = Utils.getStartLineNumber(node);
        func.endLineNum = Utils.getEndLineNumber(node);
        var params_1 = [];
        var parseChildren_3 = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.Parameter && childNode.parent === node) {
                var param = childNode;
                params_1.push(childNode.getText().replace(/\??:\s*[a-zA-Z]*/g, ''));
            }
            ts.forEachChild(childNode, parseChildren_3);
        };
        parseChildren_3(node);
        func.comment ? func.comment.isFor = comment_1.ProgramType.Function : null;
        func.parameters = params_1;
        return func;
    }
    return null;
}
function findProperty(propertyName) {
    var prop = null;
    if (_properties && _properties.length > 0) {
        prop = _properties.find(function (prop, idx) {
            return prop.name === propertyName;
        });
    }
    return prop;
}
exports.findProperty = findProperty;
function _writeDocumentation(pathInfo, component) {
    var _this = this;
    if (fs.existsSync(pathInfo.fullDocFilePath)) {
        fs.unlinkSync(pathInfo.fullDocFilePath);
    }
    var writeStream = fs.createWriteStream(pathInfo.fullDocFilePath, { encoding: 'utf8' });
    writeStream.on('open', function () {
        writeStream.write(component.toMarkup());
        writeStream.end();
    });
    writeStream.on('finish', function () {
        if (!_this.options || !_this.options.silent) {
            console.log('All writes to', pathInfo.fullDocFilePath, 'done');
        }
    });
    writeStream.on('close', function () {
        if (!_this.options || !_this.options.silent) {
            console.log('Write stream closed');
        }
    });
}
//# sourceMappingURL=index.js.map