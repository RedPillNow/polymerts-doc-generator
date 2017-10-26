import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import * as Utils from './lib/utils';
import { Behavior } from './models/behavior'
import { Comment } from './models/comment';
import { Component } from './models/component';
import { ComputedProperty } from './models/computed';
import { Function } from './models/function';
import { Listener } from './models/listener';
import { Observer } from './models/observer';
import { Property } from './models/property';
import { ProgramType } from './models/comment';

// Variables we can read/update from anywhere
let component: Component = null;
let _behaviors: Behavior[] = [];
let _functions: Function[] = [];
let _listeners: Listener[] = [];
let _observers: Observer[] = [];
let _properties: Property[] = [];

export function start(fileName: string, docPath: string): void {
	let pathInfo = Utils._getPathInfo(fileName, docPath);
	let sourceFile = ts.createSourceFile(pathInfo.fileName, fs.readFileSync(pathInfo.fileName).toString(), ts.ScriptTarget.ES2015, true);
	_parse(sourceFile);
	_writeDocumentation(pathInfo, component);
	return pathInfo.fullDocFilePath;
}
/**
 * Parse the source file and build out the component and all it's parts
 * @param {ts.SourceFile} sourceFile The ts.SourceFile
 */
function _parse(sourceFile: ts.SourceFile) {
	component = new Component();
	let nodes = 0;
	let parseNode = (node: ts.Node) => {
		// console.log('getComponent.parseNode.node.kind=', (<any>ts).SyntaxKind[node.kind], '=', node.kind);
		// console.log('node text=', node.getText());
		switch (node.kind) {
			case ts.SyntaxKind.ClassDeclaration:
				// console.log('class declaration');
				_initComponent(node);
				break;
			case ts.SyntaxKind.PropertyDeclaration:
				_getProperty(node);
				break;
			case ts.SyntaxKind.MethodDeclaration:
				_getMethod(node);
				break;
		};
		nodes++;
		ts.forEachChild(node, parseNode);
	}
	parseNode(sourceFile);
	console.log('looped through', nodes, 'nodes');
	component.behaviors = _behaviors;
	component.methods = _functions;
	component.listeners = _listeners;
	component.observers = _observers;
	component.properties = _properties;
}
/**
 * Populate the component with the values from the node
 * @param {ts.Node} node
 * @returns {Component}
 */
function _initComponent(node: ts.Node) {
	if (node && node.decorators && node.decorators.length > 0) {
		let clazz: ts.ClassDeclaration = <ts.ClassDeclaration>node;
		component.tsNode = node;
		component.className = clazz.name.getText();
		component.startLineNum = Utils._getStartLineNumber(node);
		component.endLineNum = Utils._getEndLineNumber(node);
		component.comment ? component.comment.isFor = ProgramType.Component : null;
		if (node.decorators && node.decorators.length > 0) {
			node.decorators.forEach((decorator: ts.Decorator) => {
				// console.log('decorator', decorator);
				let exp: ts.Expression = decorator.expression;
				let componentMatch = /\s*(?:component)\s*\((?:['"]{1}(.*)['"]{1})\)/.exec(exp.getText());
				component.name = componentMatch ? componentMatch[1] : null;
				let behaviorMatch = /\s*(?:behavior)\s*\((?:['"]{1}(.*)['"]{1})\)/.exec(exp.getText());
				if (behaviorMatch && behaviorMatch.length > 0) {
					let behave = new Behavior();
					behave.tsNode = decorator;
					behave.startLineNum = Utils._getStartLineNumber(decorator);
					behave.endLineNum = Utils._getEndLineNumber(decorator);
					behave.name = behaviorMatch[1];
					_behaviors.push(behave);
				}
			});
		}
	}
	return component;
}
/**
 * Build a property and push to the _properties array
 * @param {ts.Node} node
 */
function _getProperty(node: ts.Node) {
	if (node && node.kind === ts.SyntaxKind.PropertyDeclaration) {
		let tsProp = <ts.PropertyDeclaration>node;
		let prop = new Property();
		prop.tsNode = node;
		prop.startLineNum = Utils._getStartLineNumber(node);
		prop.endLineNum = Utils._getEndLineNumber(node);
		prop.name = tsProp.name.getText();
		prop.comment ? prop.comment.isFor = ProgramType.Property : null;
		let parseChildren = (childNode: ts.Node) => {
			// console.log('_getProperty.parseChildren.childNode.kind=', (<any>ts).SyntaxKind[childNode.kind], '=', childNode.kind);
			if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression) {
				let objExp = <ts.ObjectLiteralExpression>childNode;
				let objLiteralObj = Utils._getObjectLiteralString(objExp);
				prop.params = objLiteralObj.str;
				prop.type = objLiteralObj.type;
			}
			ts.forEachChild(childNode, parseChildren);
		}
		// console.log('_getProperty, ' + tsProp.name.getText() + '-' + tsProp.getChildCount() + ' kids');
		parseChildren(tsProp);
		_properties.push(prop);
	}
}
/**
 * Build a function and push to the _functions array. However, if our function
 * is an observer, computed property, listener, etc. Build the proper object
 * and push it to the proper array
 * @param {ts.Node} node
 */
function _getMethod(node: ts.Node) {
	if (node && node.kind === ts.SyntaxKind.MethodDeclaration) {
		let method: ts.MethodDeclaration = <ts.MethodDeclaration>node;
		// console.log('_getMethod for', method.name.getText(), ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart()));
		if (isComputedProperty(method)) {
			let computed: ComputedProperty = _getComputedProperty(method);
			if (computed) {
				_properties.push(computed);
			}
		} else if (isListener(method)) {
			let listener: Listener = _getListener(method);
			if (listener) {
				_listeners.push(listener);
			}
		} else if (isObserver(method)) {
			let observer: Observer = _getObserver(method);
			if (observer) {
				_observers.push(observer);
			}
		} else {
			let func: Function = _getFunction(method);
			if (func) {
				_functions.push(func);
			}
		}
	}
}
/**
 * Get a computed property if the node is a ComputedProperty
 * @param {ts.MethodDeclaration} node
 * @returns {ComputedProperty}
 */
function _getComputedProperty(node: ts.MethodDeclaration): ComputedProperty {
	if (node) {
		let computed: ComputedProperty = new ComputedProperty();
		computed.tsNode = node;
		computed.name = node.name.getText();
		computed.methodName = '_get' + Utils.capitalizeFirstLetter(node.name.getText());
		computed.startLineNum = Utils._getStartLineNumber(node);
		computed.endLineNum = Utils._getEndLineNumber(node);
		computed.comment ? computed.comment.isFor = ProgramType.Computed : null;
		let parseChildren = (childNode: ts.Node) => {
			if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression) {
				let objExp = <ts.ObjectLiteralExpression>childNode;
				let objLitObj = Utils._getObjectLiteralString(objExp);
				computed.params = objLitObj.str;
				computed.type = objLitObj.type;
			}
			ts.forEachChild(childNode, parseChildren);
		};
		parseChildren(node);
		return computed;
	}
	return null;
}
/**
 * Get a Listener if the node is a listener
 *
 * @param {ts.MethodDeclaration} node
 * @returns {Listener}
 */
function _getListener(node: ts.MethodDeclaration): Listener {
	if (node) {
		let listener: Listener = new Listener();
		listener.tsNode = node;
		listener.methodName = node.name.getText();
		listener.startLineNum = Utils._getStartLineNumber(node);
		listener.endLineNum = Utils._getEndLineNumber(node);
		listener.comment ? listener.comment.isFor = ProgramType.Listener : null;
		if (node.decorators && node.decorators.length > 0) {
			node.decorators.forEach((decorator: ts.Decorator, idx) => {
				let parseChildren = (decoratorChildNode) => {
					if (decoratorChildNode.kind === ts.SyntaxKind.StringLiteral) {
						let listenerStrNode = <ts.StringLiteral>decoratorChildNode;
						listener.eventDeclaration = listenerStrNode.getText();
					}
					ts.forEachChild(decoratorChildNode, parseChildren);
				};
				parseChildren(decorator);
			});
		}
		let sigArr: string[] = listener.eventDeclaration ? listener.eventDeclaration.split('.') : [];
		listener.eventName = sigArr[1] || null;
		listener.elementId = listener.eventName ? sigArr[0] : null;
		return listener;
	}
	return null;
}
/**
 * Get an observer object if the node is an Observer
 * @param {ts.MethodDeclaration} node
 * @returns {Observer}
 */
function _getObserver(node: ts.MethodDeclaration): Observer {
	if (node) {
		let observer: Observer = new Observer();
		observer.tsNode = node;
		observer.startLineNum = Utils._getStartLineNumber(node);
		observer.endLineNum = Utils._getEndLineNumber(node);
		observer.methodName = node.name.getText();
		observer.comment ? observer.comment.isFor = ProgramType.Observer : null;
		if (node.decorators && node.decorators.length > 0) {
			node.decorators.forEach((decorator: ts.Decorator, idx) => {
				let parseChildren = (decoratorChildNode: ts.Node) => {
					if (decoratorChildNode.kind === ts.SyntaxKind.StringLiteral) {
						let observerStrNode = <ts.StringLiteral>decoratorChildNode;
						let propsStr = observerStrNode.getText();
						propsStr = propsStr.replace(/[\s']*/g, '');
						observer.properties = propsStr.split(',');
					}
					ts.forEachChild(decoratorChildNode, parseChildren);
				};
				parseChildren(decorator);
			});
		}
		return observer;
	}
	return null;
}
/**
 * Get a function if the node is a MethodDeclaration and is not a
 * computed property, observer, listener, etc. Also, it's parent must be
 * the "component's" node
 * @param {ts.MethodDeclaration} node
 * @returns {Function}
 */
function _getFunction(node: ts.MethodDeclaration): Function {
	if (node) {
		let func: Function = new Function();
		func.tsNode = node;
		func.methodName = node.name.getText();;
		func.startLineNum = Utils._getStartLineNumber(node);
		func.endLineNum = Utils._getEndLineNumber(node);
		let params = [];
		let parseChildren = (childNode: ts.Node) => {
			// console.log('_getFunction.parseChildren.childNode.kind=', (<any>ts).SyntaxKind[childNode.kind], '=', childNode.kind)
			if (childNode.kind === ts.SyntaxKind.Parameter) {
				let param = <ts.ParameterDeclaration>childNode;
				params.push(childNode.getText());
			}
			ts.forEachChild(childNode, parseChildren);
		}
		parseChildren(node);
		func.comment ? func.comment.isFor = ProgramType.Function : null;
		func.parameters = params;
		return func;
	}
	return null;
}
/**
 * Determine of the passed in node matches the pattern of a
 * computed property. Mainly, is the decorator have a name of 'computed'
 * and all the other relevant bits are present
 * @param {ts.MethodDeclaration} node
 * @returns {boolean}
 */
function isComputedProperty(node: ts.MethodDeclaration): boolean {
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
function isListener(node: ts.MethodDeclaration): boolean {
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
function isObserver(node: ts.MethodDeclaration): boolean {
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
/**
 * Actually write out documentation. If it already exists, delete it first
 * @param {any[]} comments
 * @param {string} fileName
 */
function _writeDocumentation(pathInfo: any, component: Component): void {
	if (fs.existsSync(pathInfo.fullDocFilePath)) {
		fs.unlinkSync(pathInfo.fullDocFilePath);
	}
	let writeStream = fs.createWriteStream(pathInfo.fullDocFilePath, { encoding: 'utf8' });
	writeStream.on('open', () => {
		writeStream.write(component.toMarkup());
		writeStream.end();
	});
	writeStream.on('finish', () => {
		console.log('All writes to', pathInfo.fullDocFilePath, 'done');
	});
	writeStream.on('close', () => {
		console.log('Write stream closed');
	});
}

// For Testing Purposes
// let dataFile = path.join(__dirname, '..', 'src', 'data', 'now-address.ts');
let dataFile = path.join(__dirname, '..', 'src', 'data', 'dig-app.ts');
let docFile = path.join(__dirname, 'docs', '*');
start(dataFile, docFile);

