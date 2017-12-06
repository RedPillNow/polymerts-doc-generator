"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var path = require("path");
var Utils = require("../lib/utils");
var comment_1 = require("../models/comment");
var function_1 = require("../models/function");
var comment_2 = require("../models/comment");
var PathInfo = (function () {
    function PathInfo() {
    }
    return PathInfo;
}());
exports.PathInfo = PathInfo;
function trimRight(str) {
    return str.replace(/\s+$/, '');
}
exports.trimRight = trimRight;
function trimTabs(str) {
    return str.replace(/\t+/g, '');
}
exports.trimTabs = trimTabs;
function trimAllWhitespace(str) {
    return str.replace(/\s*/g, '');
}
exports.trimAllWhitespace = trimAllWhitespace;
function getObjectLiteralString(objExp) {
    var objLiteralObj = {};
    if (objExp && objExp.properties && objExp.properties.length > 0) {
        var paramStr = '{\n';
        for (var i = 0; i < objExp.properties.length; i++) {
            var propProperty = objExp.properties[i];
            var propPropertyKey = propProperty.name.getText();
            paramStr += '\t' + propProperty.name.getText();
            paramStr += ': ';
            paramStr += propProperty.initializer.getText();
            paramStr += (i + 1) < objExp.properties.length ? ',' : '';
            paramStr += '\n';
            if (propPropertyKey === 'type') {
                objLiteralObj.type = propProperty.initializer.getText();
            }
        }
        paramStr += '}';
        objLiteralObj.str = paramStr;
    }
    return objLiteralObj;
}
exports.getObjectLiteralString = getObjectLiteralString;
function getStringFromObject(obj) {
    var objStr = null;
    if (obj) {
        var objLength = Object.keys(obj).length;
        objStr = '{\n';
        var idx = 0;
        for (var key in obj) {
            var objVal = '\'' + obj[key] + '\'';
            if (typeof (obj[key]) === 'boolean') {
                objVal = obj[key];
            }
            objStr += '\t' + key + ': ' + objVal;
            objStr += (idx + 1) < objLength ? ',\n' : '\n';
            idx++;
        }
        objStr += '}';
    }
    return objStr;
}
exports.getStringFromObject = getStringFromObject;
function getObjectFromString(objectStr) {
    var params = {};
    var partsArr = objectStr ? objectStr.split(',') : [];
    for (var i = 0; i < partsArr.length; i++) {
        var part = partsArr[i];
        var partStr = part.replace(/[/{/}\n\t]/g, '');
        partStr = Utils.trimAllWhitespace(partStr);
        var partArr = partStr.split(':');
        partArr[1] = partArr[1] === 'true' ? true : partArr[1];
        partArr[1] = partArr[1] === 'false' ? false : partArr[1];
        params[partArr[0]] = partArr[1];
    }
    return params;
}
exports.getObjectFromString = getObjectFromString;
function getArrayFromString(arrayStr) {
    var arr = [];
    if (arrayStr) {
        var partsArr = arrayStr.replace(/[\[\]]/g, '').split(',');
        for (var i = 0; i < partsArr.length; i++) {
            var part = partsArr[i];
            if (part) {
                var partStr = part.replace(/[\n\t\[\]'"]/g, '');
                partStr = Utils.trimAllWhitespace(partStr);
                arr.push(partStr);
            }
        }
    }
    return arr;
}
exports.getArrayFromString = getArrayFromString;
function getPathInfo(fileName, docPath) {
    var pathInfo = new PathInfo;
    if (fileName) {
        var fileNameExt = path.extname(fileName);
        pathInfo.fileName = fileName;
        pathInfo.dirName = docPath;
        pathInfo.docFileName = 'doc_' + path.basename(fileName).replace(fileNameExt, '.html');
        pathInfo.fullDocFilePath = path.join(docPath, pathInfo.docFileName);
        pathInfo.htmlFileName = path.basename(fileName).replace(fileNameExt, '.html');
        pathInfo.fullHtmlFilePath = path.join(path.dirname(fileName), pathInfo.htmlFileName);
    }
    return pathInfo;
}
exports.getPathInfo = getPathInfo;
function getStartLineNumber(node) {
    var lineObj = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
    return lineObj.line + 1;
}
exports.getStartLineNumber = getStartLineNumber;
function getEndLineNumber(node) {
    var lineObj = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getEnd());
    return lineObj.line + 1;
}
exports.getEndLineNumber = getEndLineNumber;
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
exports.capitalizeFirstLetter = capitalizeFirstLetter;
function isNodeComponentChild(parentNode, component) {
    var isComponent = false;
    if (ts.isClassDeclaration(parentNode)) {
        var classDecl = parentNode;
        if (classDecl.name.getText() === component.className) {
            isComponent = true;
        }
    }
    return isComponent;
}
exports.isNodeComponentChild = isNodeComponentChild;
function getMethodFromListener(listener) {
    var listenerMethod = null;
    if (listener) {
        if (listener.methodName) {
            listenerMethod = new function_1.Function();
            listenerMethod.methodName = listener.methodName;
            listenerMethod.parameters = ['evt'];
            listenerMethod.comment = listener.comment || new comment_1.Comment();
            if (!listener.comment) {
                listenerMethod.comment.commentText = '';
            }
            listenerMethod.comment.isFor = comment_2.ProgramType.Function;
            var tags = listenerMethod.comment.tags || [];
            var hasListensTag = tags.find(function (tag) {
                return tag.indexOf('@listens') > -1;
            });
            if (!hasListensTag) {
                tags.push('@listens #' + listener.eventDeclaration);
            }
            if (!listenerMethod.comment.tags || listenerMethod.comment.tags.length === 0) {
                listenerMethod.comment.tags = tags;
            }
            listener.comment = null;
        }
        return listenerMethod;
    }
}
exports.getMethodFromListener = getMethodFromListener;
function getMethodFromComputed(computed) {
    var computedMethod = null;
    if (computed) {
        if (computed.methodName) {
            computedMethod = new function_1.Function();
            computedMethod.methodName = computed.methodName;
            if (computed.comment) {
                computedMethod.comment = new comment_1.Comment();
                computedMethod.comment.commentText = computed.comment.commentText;
                computedMethod.comment.endLineNumber = computed.comment.endLineNum;
                computedMethod.comment.startLineNumber = computed.comment.startLineNum;
                computedMethod.comment.tags = computed.comment.tags || [];
                computedMethod.comment.isFor = comment_2.ProgramType.Function;
            }
        }
    }
    return computedMethod;
}
exports.getMethodFromComputed = getMethodFromComputed;
function getMethodFromObserver(observer) {
    var observerMethod = null;
    if (observer) {
        if (observer.methodName) {
            observerMethod = new function_1.Function();
            observerMethod.methodName = observer.methodName;
            if (observer.properties && observer.properties.length > 0) {
                var paramArr = [];
                for (var i = 0; i < observer.properties.length; i++) {
                    var prop = observer.properties[i];
                    var propVal = null;
                    if (prop.indexOf('.') > -1) {
                        propVal = prop.split('.')[1];
                    }
                    else {
                        propVal = prop;
                    }
                    paramArr.push(propVal);
                }
                observerMethod.parameters = paramArr;
            }
            observerMethod.comment = observer.comment || new comment_1.Comment();
            observerMethod.comment.isFor = comment_2.ProgramType.Function;
            if (!observer.comment) {
                observerMethod.comment.commentText = '';
            }
            observer.comment = null;
        }
    }
    return observerMethod;
}
exports.getMethodFromObserver = getMethodFromObserver;
function isComputedProperty(node) {
    var isComputed = false;
    if (node && node.decorators && node.decorators.length > 0) {
        node.decorators.forEach(function (val, idx) {
            var exp = val.expression;
            var expText = exp.getText();
            var decoratorMatch = /\s*(?:computed)\s*\((?:\{*(.*)\}*)\)/.exec(expText);
            isComputed = decoratorMatch && decoratorMatch.length > 0 ? true : false;
        });
    }
    return isComputed;
}
exports.isComputedProperty = isComputedProperty;
function isListener(node) {
    var isListener = false;
    if (node && node.decorators && node.decorators.length > 0) {
        node.decorators.forEach(function (val, idx) {
            var exp = val.expression;
            var expText = exp.getText();
            var decoratorMatch = /\s*(?:listen)\s*\((?:\{*(.*)\}*)\)/.exec(expText);
            isListener = decoratorMatch && decoratorMatch.length > 0 ? true : false;
        });
    }
    return isListener;
}
exports.isListener = isListener;
function isObserver(node) {
    var isObserver = false;
    if (node && node.decorators && node.decorators.length > 0) {
        node.decorators.forEach(function (val, idx) {
            var exp = val.expression;
            var expText = exp.getText();
            var decoratorMatch = /\s*(?:observe)\s*\((?:['"]{1}(.*)['"]{1})\)/.exec(expText);
            isObserver = decoratorMatch && decoratorMatch.length > 0 ? true : false;
        });
    }
    return isObserver;
}
exports.isObserver = isObserver;
//# sourceMappingURL=utils.js.map