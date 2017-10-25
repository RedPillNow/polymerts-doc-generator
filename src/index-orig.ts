import * as fs from 'fs';
import * as path from 'path';
import * as parse from 'parse-comments';
import * as Utils from './lib/utils';
import { Comment } from './models/comment';
import { Property } from './models/property';
import { Listener } from './models/listener';
import { ComputedProperty } from './models/computed';
import { Observer } from './models/observer';
import { Component } from './models/component';
import { Function } from './models/function';
import { Behavior } from './models/behavior'

/**
 * Build the documentation
 * @param {string} fileName
 */
function start(fileName: string, docPath: string): void {
	let pathInfo = _getPathInfo(fileName, docPath);
	// let comments: any[] = getComments(pathInfo.fileName)
	let component: Component = _gatherProgramParts(pathInfo.fileName);
	// _writeDocumentation(pathInfo, component);
	return pathInfo.fullDocFilePath;
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
function _getPathInfo(fileName: string, docPath: string): any {
	let pathInfo: any = {};
	if (fileName) {
		pathInfo.fileName = fileName;
		pathInfo.dirName = path.dirname(docPath);
		pathInfo.docFileName = 'doc_' + path.basename(fileName) + '.html';
		pathInfo.fullDocFilePath = path.join(pathInfo.dirName, pathInfo.docFileName);
	}
	return pathInfo;
}
/**
 * Get the comments
 *
 * @param {String} fileName
 * @returns {any[]}
 */
function getComments(fileName: string): any[] {
	let readFile = fs.readFileSync(fileName, 'utf8')
	let comments = parse(readFile) || [];
	return comments;
}
/**
 * This will gather all the different program parts and add them to a
 * Component instance
 * @param {string} fileName
 * @returns {Component}
 * @todo ack this is UGLY and HUGE
 */
function _gatherProgramParts(fileName: string): Component {
	let component = new Component();
	const readFile: string = fs.readFileSync(fileName, 'utf8');
	// comment
	let comment: Comment = null;
	const startComment = /^\s*\/\*\*?/;
	const endComment = /(?:\s)*(?:\*\/)/;
	let isComment = false;
	// method
	let method: Function = null;
	const startMethod = /^\s*((?:\w+)*\s*\((?:[^),]*)(?:\s*,\s*[^),]*)*\)\s*{)\n/;
	const endMethod = /\s*}/;
	let isMethod = false;
	let isBlockInMethod = false;
	// component & behavior
	const startComponent = /\s*(?:@component)\s*\((?:['"]{1}(.*)['"]{1})\)/;
	const startBehavior = /\s*(?:@behavior)\s*\((.*)\)/;
	// property
	let property: Property = null;
	let propertyParams = {};
	const startProperty = /\s*@(?:property){1}\s*\(\s*{\n/;
	const endProperty = /\s*(\w*):\s*([a-zA-Z.-]*);/;
	let isProperty = false;
	// observer
	let observer: Observer = null;
	let isObserver = false;
	const startObserver = null;
	const endObserver = null;
	// listener
	let listener: Listener = null;
	let isListener = false;
	const startListener = null;
	const endListener = null;
	// placeholder variables
	let behaviors = [];
	let listeners = [];
	let methods = [];
	let observers = [];
	let properties = [];

	const lines = readFile.split(/[\r\n]/);
	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		let lineNum = i + 1;
		if (!isComment && startComment.test(line)) {
			isComment = true;
			comment = new Comment();
			comment.startLineNum = lineNum;
			comment.commentText = line;
		}
		if (isComment && endComment.test(line)) {
			comment.commentText += line;
			comment.endLineNum = lineNum;
			isComment = false;
		}
		if (isComment && lineNum > comment.startLineNum) {
			comment.commentText += line;
		}
		// Component - May have comments so must come after comment
		if (startComponent.test(line)) {
			let compMatch = startComponent.exec(line);
			if (compMatch && compMatch.length > 0) {
				component.name = compMatch[1];
				component.startLineNum = lineNum;
				component.comment = comment;
				comment = null;
			}
		} // TODO Get the component class name and what it extends
		// Behavior
		if (startBehavior.test(line)) {
			let behMatch = startBehavior.exec(line);
			if (behMatch && behMatch.length > 0) {
				let behavior = new Behavior();
				behavior.name = behMatch[1];
				behavior.comment = comment;
				behavior.startLineNum = lineNum;
				behavior.endLineNum = lineNum;
				behaviors.push(behavior);
				comment = null;
			}
		}
		// Property
		if (!isProperty && startProperty.test(line)) {
			isProperty = true;
			property = new Property();
			property.comment = comment;
			property.startLineNum = lineNum;
			comment = null;
		}
		if (isProperty && endProperty.test(line)) {
			let propNameMatch = endProperty.exec(line);
			property.name = propNameMatch[1];
			property.type = propNameMatch[2];
			property.params = JSON.stringify(propertyParams);
			properties.push(property);
			propertyParams = {};
			isProperty = false;
		}
		if (isProperty && lineNum > property.startLineNum) {
			let paramMatch = /\s*(\w*):\s*([a-zA-Z,-]*)/.exec(line);
			if (paramMatch && paramMatch.length > 0) {
				let accept = ['type', 'notify', 'value', 'observer', 'computed', 'reflectToAttribute'];
				if (accept.indexOf(paramMatch[1]) > -1) {
					propertyParams[paramMatch[1]] = paramMatch[2];
				}
			}
		}
		// Method
		if (!isMethod && startMethod.test(line)) {
			isMethod = true;
			method = new Function();
			method.signature = line;
			method.startLineNum = lineNum;
		}
		if (isMethod && endMethod.test(line)) {
			if (!isBlockInMethod) {
				method.endLineNum = lineNum;
				isBlockInMethod = false;
				isMethod = false;
			} else {
				isBlockInMethod = false;
			}
		}
		if (isMethod && !isBlockInMethod) {
			isBlockInMethod = /(if|for|while)\s*/.test(line);
		}
	}
	component.behaviors = behaviors;
	component.listeners = listeners;
	component.methods = methods;
	component.observers = observers;
	component.properties = properties;
	return component;
}
/**
 * Write out the comments we found along with the function call
 * @param {any} commentsArr
 * @param {any} writeStream
 * @param {string} fileName
 */
function _gatherProgramParts_DEPRECATED(commentsArr: any[], fileName: string): Component {
	let component = new Component();
	for (let i = 0; i < commentsArr.length; i++) {
		let comment = new Comment(commentsArr[i]);
		let lines = _getLines(comment.startLineNum - 2, fileName);
		if (lines && lines.length > 0) {
			let codeBlock = lines.join('\n');
			let match = null;
			if (match = /(?:\t*@property)\(({[\s\S]*?})\)([\s\S]*?(?:;))/.exec(codeBlock)) {
				// Property
				let property = new Property();
				property.name = Utils.Utils.trimTabs(match[2]);
				property.comment = comment;
				property.params = Utils.Utils.trimTabs(match[1]);
				component.properties.push(property);
			} else if (match = /(?:@listen)\(([a-zA-Z0-9._-]*)\)\n\s*(?:private )?([a-zA-Z_]*)/.exec(codeBlock)) {
				// Listener
				let listener = new Listener();
				listener.comment = comment;
				// listener.name = Utils.Utils.trimTabs(match[1]);
				listener.methodName = Utils.Utils.trimTabs(match[2]);
				component.listeners.push(listener);
			} else if (match = /(?:@(component|behavior))\('([a-zA-Z-\[\]]*)+'\)\n/.exec(codeBlock)) {
				// Component or Behavior
				if (match[1] === 'component') {
					component.name = Utils.Utils.trimTabs(match[2]);
				} else if (match[1] === 'behavior') {
					console.log('got a behavior', match);
				}
			} else if (match = /(?:\t*@computed\(\){1})([\s\S]*?{)/.exec(codeBlock)) {
				// Computed
				// TODO we need to split out the name and any parameters so we can properly write
				// out an actual property object
				let computed = new ComputedProperty();
				computed.comment = comment;
				computed.methodName = Utils.Utils.trimTabs(match[1]);
				computed.name = Utils.Utils.trimTabs(match[1]);
				// component.properties.push(computed);
			} else if (match = /(?:\t*@observe\([\s\S]+\){1})\n([\s\S]*?{)/.exec(codeBlock)) {
				// Observer
				// TODO we need to split out the property we're observing and just return
				let observer = new Observer();
				observer.comment = comment;
				observer.methodName = Utils.Utils.trimTabs(match[1]);
				component.observers.push(observer);
			}
		}
	}
	return component;
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
/**
 * Get the next 10 lines from where the code starts and run the callback. The relevant 10 lines
 * will be in the 2nd parameter of the callback
 * @param {any} startLineNum
 * @param {any} fileName
 * @param {function} callback returns 2 parameters (err, relevantLines)
 * @deprecated
 */
function _getLines(startLineNum: number, fileName: string): string[] {
	let relevantLines = [];
	let data = fs.readFileSync(fileName, 'utf8');
	let lines = data.split('\n');
	let startLine = +startLineNum;
	if (startLine > lines.length) {
		throw new Error('File doesn\'t contain ' + startLine + ' lines!');
	}
	for (let i = startLine; i < startLine + 10; i++) {
		let line = lines[i];
		relevantLines.push(line);
	}
	return relevantLines;
}

// For Testing Purposes
let dataFile = path.join(__dirname, '..', 'src', 'data', 'dig-app.ts');
let docFile = path.join(__dirname, 'docs', '*');
start(dataFile, docFile);

// Expose these methods externally
module.exports.start = start;
