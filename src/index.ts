import * as fs from 'fs';
import * as path from 'path';
import * as parse from 'parse-comments';
import * as Utils from './lib/utils';
import { Comment } from './models/comment';
import { Property } from './models/property';
import { Listener } from './models/listener';
import { ComputedProperty } from './models/computed';
import { Observer } from './models/observer';

let properties: Property[] = [];
let behaviors = [];
let component = null;
let listeners: Listener[] = [];
let observers = [];

/**
 * Build the documentation
 * @param {string} fileName
 */
function start(fileName: string, docPath: string): void {
	let pathInfo = _getPathInfo(fileName, docPath);
	let comments: any[] = getComments(pathInfo.fileName)
	_gatherProgramParts(comments, pathInfo.fileName);
	_writeDocumentation(pathInfo);
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
 * Write out the comments we found along with the function call
 * @param {any} commentsArr
 * @param {any} writeStream
 * @param {string} fileName
 */
function _gatherProgramParts(commentsArr: any[], fileName: string): void {
	for (let i = 0; i < commentsArr.length; i++) {
		let comment = new Comment(commentsArr[i]);
		let lines = _getLines(comment.commentStartLine - 2, fileName);
		if (lines && lines.length > 0) {
			let codeBlock = lines.join('\n');
			let match = null;
			if (match = /(?:\t*@property)\(({[\s\S]*?})\)([\s\S]*?(?:;))/.exec(codeBlock)) {
				// Property
				let property = new Property();
				property.name = Utils.Utils.trimTabs(match[2]);
				property.comment = comment;
				property.params = Utils.Utils.trimTabs(match[1]);
				properties.push(property);
			} else if (match = /(?:@listen)\(([a-zA-Z0-9._-]*)\)\n\s*(?:private )?([a-zA-Z_]*)/.exec(codeBlock)) {
				// Listener
				let listener = new Listener();
				listener.comment = comment;
				listener.name = Utils.Utils.trimTabs(match[1]);
				listener.methodName = Utils.Utils.trimTabs(match[2]);
				listeners.push(listener);
			} else if (match = /(?:@(component|behavior))\(([a-zA-Z'-\[\]]*)+\)\n/.exec(codeBlock)) {
				// Component or Behavior
				if (match[1] === 'component') {
					component = Utils.Utils.trimTabs(match[2]);
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
				properties.push(computed);
			} else if (match = /(?:\t*@observe\([\s\S]+\){1})\n([\s\S]*?{)/.exec(codeBlock)) {
				// Observer
				// TODO we need to split out the property we're observing and just return
				let observer = new Observer();
				observer.comment = comment;
				observer.methodName = Utils.Utils.trimTabs(match[1]);
				observers.push(observer);
			}
		}
	}
	console.log('writeComments break')
}
/**
 * Actually write out documentation. If it already exists, delete it first
 * @param {any[]} comments
 * @param {string} fileName
 */
function _writeDocumentation(pathInfo: any): void {
	if (fs.existsSync(pathInfo.fullDocFilePath)) {
		fs.unlinkSync(pathInfo.fullDocFilePath);
	}
	let writeStream = fs.createWriteStream(pathInfo.fullDocFilePath, { encoding: 'utf8' });
	writeStream.on('open', () => {
		_writeHtmlTop(writeStream, path.basename(pathInfo.fileName));
		// TODO Write program parts here
		_writeCloseHtml(writeStream);
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
 * write the top portion of the html (i.e. dom-module, template, style, script)
 * @param {any} writeStream
 * @param {any} fileName
 */
function _writeHtmlTop(writeStream: fs.WriteStream, fileName: string): void {
	let ext = fileName.split('.');
	let fileNameOnly = ext[0];
	let htmlStr = '<dom-module id="' + fileNameOnly + '">\n';
	htmlStr += '<template>\n';
	htmlStr += '<style></style>\n';
	htmlStr += '<script>\n';
	htmlStr += '(function() {\n';
	htmlStr += 'Polymer({\n';
	htmlStr += 'is:\'' + '\'\n';
	writeStream.write(htmlStr);
}
/**
 * Close the html file out (i.e. /script, /template, /dom-module)
 * @param {any} writeStream
 */
function _writeCloseHtml(writeStream: fs.WriteStream): void {
	let htmlStr = '});\n';
	htmlStr += '})();\n';
	htmlStr += '</script>\n';
	htmlStr += '</template>\n';
	htmlStr += '</dom-module>\n';
	writeStream.write(htmlStr);
}
/**
 * Get the next 10 lines from where the code starts and run the callback. The relevant 10 lines
 * will be in the 2nd parameter of the callback
 * @param {any} startLineNum
 * @param {any} fileName
 * @param {function} callback returns 2 parameters (err, relevantLines)
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
module.exports.getComments = getComments;
