import * as ts from 'typescript';
import * as path from 'path';
import * as Utils from '../lib/utils';
import { Component } from '../models/component';
import { Comment } from '../models/comment';
import { Listener } from '../models/listener';
import { Function } from '../models/function';
import { ProgramType } from '../models/comment';
import { Observer } from '../models/observer';
import { ComputedProperty } from '../models/computed';
/**
 * An empty class for the PathInfo object. Used mainly for property
 * checking and typeahead
 * @export
 * @class PathInfo
 */
export class PathInfo {
	fileName: string;
	dirName: string;
	docFileName: string;
	fullDocFilePath: string;
	htmlFileName: string;
	fullHtmlFilePath: string;
}
/**
 * Trim all whitespace to the right of a string
 * @export
 * @param {any} str
 * @returns {string}
 */
export function trimRight(str): string {
	return str.replace(/\s+$/, '');
}
/**
 * Trim all tabs from a string
 * @export
 * @param {any} str
 * @returns {string}
 */
export function trimTabs(str): string {
	return str.replace(/\t+/g, '');
}
/**
 * Trim all whitespace from a string
 * @export
 * @param {any} str
 * @returns {string}
 */
export function trimAllWhitespace(str): string {
	return str.replace(/\s*/g, '');
}
/**
 * Build a string from an object literal node
 * @export
 * @param {ts.ObjectLiteralExpression} objExp
 * @returns {any}
 */
export function getObjectLiteralString(objExp: ts.ObjectLiteralExpression): any {
	let objLiteralObj:any = {};
	if (objExp && objExp.properties && objExp.properties.length > 0) {
		let paramStr = '{\n';
		for (let i = 0; i < objExp.properties.length; i++) {
			let propProperty: ts.PropertyAssignment = (<ts.PropertyAssignment>objExp.properties[i]);
			let propPropertyKey = propProperty.name.getText();
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
/**
 * Build a String from an Object
 * @export
 * @param {*} obj
 * @returns {string}
 */
export function getStringFromObject(obj: any): string {
	let objStr = null;
	if (obj) {
		let objLength = Object.keys(obj).length;
		objStr = '{\n';
		let idx = 0;
		for (let key in obj) {
			let objVal = '\'' + obj[key] + '\'';
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
/**
 * Get an object from a string formatted as an object
 * @export
 * @param {string} objectStr
 * @returns {any}
 */
export function getObjectFromString(objectStr: string): any {
	let params = {};
	let partsArr = objectStr ? objectStr.split(',') : [];
	for (let i = 0; i < partsArr.length; i++) {
		let part = partsArr[i];
		let partStr = part.replace(/[/{/}\n\t]/g, '');
		partStr = Utils.trimAllWhitespace(partStr);
		let partArr: any[] = partStr.split(':');
		partArr[1] = partArr[1] === 'true' ? true : partArr[1];
		partArr[1] = partArr[1] === 'false' ? false : partArr[1];
		params[partArr[0]] = partArr[1];
	}
	return params;
}
/**
 * Produce an array from a string which is formatted as an array
 * @export
 * @param {string} arrayStr
 * @returns {any}
 */
export function getArrayFromString(arrayStr: string): any {
	let arr = [];
	if (arrayStr) {
		let partsArr = arrayStr.replace(/[\[\]]/g, '').split(',');
		for (let i = 0; i < partsArr.length; i++) {
			let part = partsArr[i];
			if (part) {
				let partStr = part.replace(/[\n\t\[\]'"]/g, '');
				partStr = Utils.trimAllWhitespace(partStr);
				arr.push(partStr);
			}
		}
	}
	return arr;
}
/**
 * Get the pieces of the path for fileName
 * @param {string} fileName
 * @returns {any} pathInfo
 * @property {string} pathInfo.fileName - The original source file name
 * @property {string} pathInfo.dirName - The directory name for fileName
 * @property {string} pathInfo.docFileName - The generated documentation file name
 * @property {string} pathInfo.fullDocFilePath - The full path to pathInfo.docFileName
 */
export function getPathInfo(fileName: string, docPath: string): PathInfo {
	let pathInfo: PathInfo = new PathInfo;
	if (fileName) {
		let fileNameExt = path.extname(fileName);
		pathInfo.fileName = fileName;
		pathInfo.dirName = docPath;
		pathInfo.docFileName = 'doc_' + path.basename(fileName).replace(fileNameExt, '.html');
		pathInfo.fullDocFilePath = path.join(docPath, pathInfo.docFileName);
		pathInfo.htmlFileName = path.basename(fileName).replace(fileNameExt, '.html');
		pathInfo.fullHtmlFilePath = path.join(path.dirname(fileName), pathInfo.htmlFileName);
	}
	return pathInfo;
}
/**
 * Get the starting line number for a node
 * @export
 * @param {ts.Node} node
 * @returns {number}
 */
export function getStartLineNumber(node: ts.Node): number {
	let lineObj = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
	return lineObj.line + 1;
}
/**
 * Get the ending line number for a node
 * @export
 * @param {ts.Node} node
 * @returns {number}
 */
export function getEndLineNumber(node: ts.Node): number {
	let lineObj = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getEnd());
	return lineObj.line + 1;
}
/**
 * Capitalize the first letter of a string
 * @export
 * @param {string} str
 * @returns {string}
 */
export function capitalizeFirstLetter(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
 * Determine if a property is a child of the Component node
 * @export
 * @param {ts.Node} parentNode The property's parent node
 * @param {Component} component The component
 * @returns {boolean}
 */
export function isNodeComponentChild(parentNode: ts.Node, component: Component): boolean {
	let isComponent = false;
	if (ts.isClassDeclaration(parentNode)) {
		let classDecl = <ts.ClassDeclaration>parentNode;
		if (classDecl.name.getText() === component.className) {
			isComponent = true;
		}
	}
	return isComponent;
}
/**
 * Create a method from the listener
 * @export
 * @param {Listener} listener
 * @returns {Function}
 */
export function getMethodFromListener(listener: Listener): Function {
	let listenerMethod = null;
	if (listener) {
		if (listener.methodName) {
			listenerMethod = new Function();
			listenerMethod.methodName = listener.methodName;
			listenerMethod.parameters = ['evt'];
			listenerMethod.comment = listener.comment || new Comment();
			if (!listener.comment) {
				listenerMethod.comment.commentText = '';
			}
			listenerMethod.comment.isFor = ProgramType.Function;
			let tags = listenerMethod.comment.tags || [];
			let hasListensTag = tags.find((tag) => {
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
/**
 * Create a method from a computed property
 * @export
 * @param {ComputedProperty} computed
 * @returns {Function}
 */
export function getMethodFromComputed(computed: ComputedProperty): Function {
	let computedMethod = null;
	if (computed) {
		if (computed.methodName) {
			computedMethod = new Function();
			computedMethod.methodName = computed.methodName;
			if (computed.comment) {
				computedMethod.comment = new Comment();
				computedMethod.comment.commentText = computed.comment.commentText;
				computedMethod.comment.endLineNumber = computed.comment.endLineNum;
				computedMethod.comment.startLineNumber = computed.comment.startLineNum;
				computedMethod.comment.tags = computed.comment.tags || [];
				computedMethod.comment.isFor = ProgramType.Function;
			}
		}
	}
	return computedMethod;
}
/**
 * Create a method from an observer
 * @export
 * @param {Observer} observer
 * @returns {Function}
 */
export function getMethodFromObserver(observer: Observer): Function {
	let observerMethod: Function = null;
	if (observer) {
		if (observer.methodName) {
			observerMethod = new Function();
			observerMethod.methodName = observer.methodName;
			if (observer.properties && observer.properties.length > 0) {
				let paramArr = [];
				for (let i = 0; i < observer.properties.length; i++) {
					let prop = observer.properties[i];
					let propVal = null;
					if (prop.indexOf('.') > -1) {
						propVal = prop.split('.')[1];
					} else {
						propVal = prop;
					}
					paramArr.push(propVal);
				}
				observerMethod.parameters = paramArr;
			}
			observerMethod.comment = observer.comment || new Comment();
			observerMethod.comment.isFor = ProgramType.Function;
			if (!observer.comment) {
				observerMethod.comment.commentText = '';
			}
			observer.comment = null;
		}
	}
	return observerMethod;
}
/**
 * Determine of the passed in node matches the pattern of a
 * computed property. Mainly, is the decorator have a name of 'computed'
 * and all the other relevant bits are present
 * @param {ts.MethodDeclaration} node
 * @returns {boolean}
 */
export function isComputedProperty(node: ts.MethodDeclaration): boolean {
	let isComputed = false;
	if (node && node.decorators && node.decorators.length > 0) {
		node.decorators.forEach((val: ts.Decorator, idx: number) => {
			let exp = val.expression;
			let expText = exp.getText();
			let decoratorMatch = /\s*(?:computed)\s*\((?:\{*(.*)\}*)\)/.exec(expText);
			isComputed = decoratorMatch && decoratorMatch.length > 0 ? true : false;
		});
	}
	return isComputed;
}
/**
 * Determine if the passed in node matches the pattern of a
 * listener. Mainly, does the decorator have a name of 'listen'
 * and all the other relevant bits are present
 * @param {ts.MethodDeclaration} node
 * @returns {boolean}
 */
export function isListener(node: ts.MethodDeclaration): boolean {
	let isListener = false;
	if (node && node.decorators && node.decorators.length > 0) {
		node.decorators.forEach((val: ts.Decorator, idx: number) => {
			let exp = val.expression;
			let expText = exp.getText();
			let decoratorMatch = /\s*(?:listen)\s*\((?:\{*(.*)\}*)\)/.exec(expText);
			isListener = decoratorMatch && decoratorMatch.length > 0 ? true : false;
		});
	}
	return isListener;
}
/**
 * Determine if the passed in node matches the pattern of a
 * observer. Mainly, does the decorator have a name of 'observe'
 * and all the other relevant bits are present
 * @param {ts.MethodDeclaration} node
 * @returns {boolean}
 */
export function isObserver(node: ts.MethodDeclaration): boolean {
	let isObserver = false;
	if (node && node.decorators && node.decorators.length > 0) {
		node.decorators.forEach((val: ts.Decorator, idx: number) => {
			let exp = val.expression;
			let expText = exp.getText();
			let decoratorMatch = /\s*(?:observe)\s*\((?:['"]{1}(.*)['"]{1})\)/.exec(expText);
			isObserver = decoratorMatch && decoratorMatch.length > 0 ? true : false;
		});
	}
	return isObserver;
}
