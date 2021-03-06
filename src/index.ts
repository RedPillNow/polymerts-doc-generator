import * as fs from 'fs';
// import * as path from 'path';
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

// DECISION: Instead of passing along strings, maybe we should populate the models
// with the actual objects. For example instead of '["arr1","arr2"]', pass along
// the actual array. This might cause some problems, but I think it'll be easier
// to parse the output

// DECISION: Based on the above decision, instead of manually storing strings of
// the whole piece of code, maybe we should be figuring stuff out from the node
// of each model. This would alleviate a lot of the work arounds put in place
// to deal with errant quotes, indentations, etc. The downside here is that it
// will make the models much heavier, however it will probably make this product
// more stable.

// Variables we can read/update from anywhere
let component: Component = new Component();
exports.component = component;
let _behaviors: Behavior[] = [];
let _functions: Function[] = [];
let _listeners: Listener[] = [];
let _observers: Observer[] = [];
let _properties: Property[] = [];
let _options = null;

export function reset() {
	component = new Component();
	_behaviors = [];
	_functions = [];
	_listeners = [];
	_observers = [];
	_properties = [];
}
/**
 * Start the parsing process and then write the documentation from items gathered
 * during the parsing process.
 * @export
 * @param {any} opts - An options object
 * @property {boolean} opts.silent - If true will stop all console.log output
 * @param {string} fileName - Full Path to the .ts file to parse
 * @param {string} docPath - Full Path to the directory to store documentation in
 * @returns {string} Full Path and filename of the generated documentation
 */
export function start(opts: any, fileName: string, docPath: string): string {
	_options = opts || {};
	let pathInfo: Utils.PathInfo = Utils.getPathInfo(fileName, docPath);
	component.htmlFilePath = pathInfo.fullHtmlFilePath;
	let sourceFile = ts.createSourceFile(pathInfo.fileName, fs.readFileSync(pathInfo.fileName).toString(), ts.ScriptTarget.ES2015, true);
	parseTs(sourceFile);
	_writeDocumentation(pathInfo, component);
	return pathInfo.fullDocFilePath;
}
/**
 * Parse the source file and build out the component and all it's parts
 * @param {ts.SourceFile} sourceFile The ts.SourceFile
 * @returns {Component}
 */
export function parseTs(sourceFile: ts.SourceFile): Component {
	let nodes = 0;
	let parseNode = (node: ts.Node) => {
		// console.log('parseTs.parseNode.node.kind=', (<any>ts).SyntaxKind[node.kind], '=', node.kind);
		// console.log('node text=', node.getText());
		switch (node.kind) {
			case ts.SyntaxKind.ClassDeclaration:
				// console.log('class declaration');
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
		};
		nodes++;
		ts.forEachChild(node, parseNode);
	}
	parseNode(sourceFile);
	component.behaviors = _behaviors;
	component.methods = _functions;
	component.listeners = _listeners;
	component.observers = _observers;
	component.properties = _properties;
	// console.log('looped through', nodes, 'nodes');
	return component;
	// console.log('component=', component);
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
		component.startLineNum = Utils.getStartLineNumber(node);
		component.endLineNum = Utils.getEndLineNumber(node);
		component.comment ? component.comment.isFor = ProgramType.Component : null;
		if (node.decorators && node.decorators.length > 0) {
			node.decorators.forEach((decorator: ts.Decorator) => {
				// console.log('decorator', decorator);
				let exp: ts.Expression = decorator.expression;
				let expText = exp.getText();
				let componentMatch = /\s*(?:component)\s*\((?:['"]{1}(.*)['"]{1})\)/.exec(exp.getText());
				let behaviorMatch = /\s*(?:behavior)\s*\((...*)\)/.exec(exp.getText());
				if (componentMatch && componentMatch.length > 0) {
					component.name = componentMatch[1];
				} else if (behaviorMatch && behaviorMatch.length > 0) {
					let behave = new Behavior();
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
/**
 * Build a property and push to the _properties array
 * @param {ts.Node} node
 */
function _getProperty(node: ts.Node) {
	if (node && node.kind === ts.SyntaxKind.PropertyDeclaration) {
		let tsProp = <ts.PropertyDeclaration>node;
		let isInComponent = Utils.isNodeComponentChild(tsProp.parent, component);
		let insideProperty = false;
		if (isInComponent && tsProp.decorators && tsProp.decorators.length > 0) {
			let prop = new Property();
			prop.tsNode = node;
			prop.startLineNum = Utils.getStartLineNumber(node);
			prop.endLineNum = Utils.getEndLineNumber(node);
			prop.name = tsProp.name.getText();
			prop.comment ? prop.comment.isFor = ProgramType.Property : null;
			let parseChildren = (childNode: ts.Node) => {
				if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression) {
					let objExp = <ts.ObjectLiteralExpression>childNode;
					if (!insideProperty) {
						let objLiteralObj = Utils.getObjectLiteralString(objExp);
						prop.params = objLiteralObj.str;
						prop.type = objLiteralObj.type;
						insideProperty = true;
					} else {
						prop.containsValueObjectDeclaration = true;
						prop.valueObjectParams = Utils.getObjectLiteralString(objExp).str;
					}
				} else if (childNode.kind === ts.SyntaxKind.ArrowFunction) {
					prop.containsValueFunction = true;
				} else if (childNode.kind === ts.SyntaxKind.FunctionExpression) {
					prop.containsValueFunction = true;
				} else if (childNode.kind === ts.SyntaxKind.ArrayLiteralExpression) {
					let arrayLiteral = <ts.ArrayLiteralExpression>childNode;
					prop.containsValueArrayLiteral = true;
					prop.valueArrayParams = arrayLiteral.getText();
				}
				ts.forEachChild(childNode, parseChildren);
			}
			parseChildren(tsProp);
			_properties.push(prop);
		}
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
		if (Utils.isComputedProperty(method)) {
			let computed: ComputedProperty = _getComputedProperty(method);
			if (computed) {
				let computedMethod = Utils.getMethodFromComputed(computed);
				_functions.push(computedMethod);
				_properties.push(computed);
			}
		} else if (Utils.isListener(method)) {
			let listener: Listener = _getListener(method);
			if (listener) {
				if (listener.methodName) {
					let listenerMethod = Utils.getMethodFromListener(listener);
					_functions.push(listenerMethod);
				}
				_listeners.push(listener);
			}
		} else if (Utils.isObserver(method)) {
			let observer: Observer = _getObserver(method);
			if (observer) {
				let observerMethod = Utils.getMethodFromObserver(observer);
				_functions.push(observerMethod);
				if ((observer.properties && observer.properties.length === 1) && observer.properties[0].indexOf('.') === -1) {
					let property: Property = findProperty(observer.properties[0]);
					try {
						let propertyParamObj = Utils.getObjectFromString(property.params);
						propertyParamObj.observer = observer.methodName;
						property.params = Utils.getStringFromObject(propertyParamObj);
					} catch (e) {
						throw new Error('Property: \'' + observer.properties[0] + '\' for observer method \'' + observerMethod.methodName + '\' is not defined as a property on the component');
					}
				} else {
					_observers.push(observer);
				}
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
 * @todo Need to create the function
 */
function _getComputedProperty(node: ts.MethodDeclaration): ComputedProperty {
	if (node) {
		let computed: ComputedProperty = new ComputedProperty();
		computed.tsNode = node;
		computed.name = node.name.getText();
		computed.methodName = '_get' + Utils.capitalizeFirstLetter(node.name.getText().replace(/_/g, ''));
		computed.startLineNum = Utils.getStartLineNumber(node);
		computed.endLineNum = Utils.getEndLineNumber(node);
		computed.comment ? computed.comment.isFor = ProgramType.Computed : null;
		let parseChildren = (childNode: ts.Node) => {
			if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression) {
				let objExp = <ts.ObjectLiteralExpression>childNode;
				let objLitObj = Utils.getObjectLiteralString(objExp);
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
		listener.startLineNum = Utils.getStartLineNumber(node);
		listener.endLineNum = Utils.getEndLineNumber(node);
		listener.comment ? listener.comment.isFor = ProgramType.Listener : null;
		if (node.decorators && node.decorators.length > 0) {
			node.decorators.forEach((decorator: ts.Decorator, idx) => {
				let parseChildren = (decoratorChildNode) => {
					let kindStr = (<any>ts).SyntaxKind[decoratorChildNode.kind] + '=' + decoratorChildNode.kind;
					switch (decoratorChildNode.kind) {
						case ts.SyntaxKind.StringLiteral:
							let listenerStrNode = <ts.StringLiteral>decoratorChildNode;
							listener.eventDeclaration = listenerStrNode.getText();
							break;
						case ts.SyntaxKind.PropertyAccessExpression:
							let listenerPropAccExp = <ts.PropertyAccessExpression>decoratorChildNode;
							listener.eventDeclaration = listenerPropAccExp.getText();
							listener.isExpression = true;
							break;
					};
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
		observer.startLineNum = Utils.getStartLineNumber(node);
		observer.endLineNum = Utils.getEndLineNumber(node);
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
		func.startLineNum = Utils.getStartLineNumber(node);
		func.endLineNum = Utils.getEndLineNumber(node);
		let params = [];
		let parseChildren = (childNode: ts.Node) => {
			// console.log('_getFunction.parseChildren.childNode.kind=', (<any>ts).SyntaxKind[childNode.kind], '=', childNode.kind)
			if (childNode.kind === ts.SyntaxKind.Parameter && childNode.parent === node) {
				let param = <ts.ParameterDeclaration>childNode;
				params.push(childNode.getText().replace(/\??:\s*[a-zA-Z]*/g, ''));
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
 * Find a property in the _properties array by it's name
 * @param {string} propertyName
 * @returns {Property}
 */
export function findProperty(propertyName: string): Property {
	let prop = null;
	if (_properties && _properties.length > 0) {
		prop = _properties.find((prop: Property, idx) => {
			return prop.name === propertyName;
		});
	}
	return prop;
}
/**
 * Actually write out documentation. If it already exists, delete it first
 * @param {any[]} comments
 * @param {string} fileName
 */
function _writeDocumentation(pathInfo: Utils.PathInfo, component: Component): void {
	if (fs.existsSync(pathInfo.fullDocFilePath)) {
		fs.unlinkSync(pathInfo.fullDocFilePath);
	}
	let writeStream = fs.createWriteStream(pathInfo.fullDocFilePath, { encoding: 'utf8' });
	writeStream.on('open', () => {
		writeStream.write(component.toMarkup());
		writeStream.end();
	});
	writeStream.on('finish', () => {
		if (!_options || !_options.silent) {
			console.log('All writes to', pathInfo.fullDocFilePath, 'done');
		}
	});
	writeStream.on('close', () => {
		if (!_options || !_options.silent) {
			console.log('Write stream closed');
		}
	});
}

// For Testing Purposes
// let dataFile = path.join(__dirname, '..', 'src', 'data', 'now-address.ts');
// let dataFile = path.join(__dirname, '..', 'src', 'data', 'dig-app.ts');
// let docFile = path.join(__dirname, 'docs', '*');
// start(dataFile, docFile);

