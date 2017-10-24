import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { Component } from './models/component';

function start(fileName: string, docPath: string): void {
	let pathInfo = _getPathInfo(fileName, docPath);
	let sourceFile = ts.createSourceFile(pathInfo.fileName, fs.readFileSync(pathInfo.fileName).toString(), ts.ScriptTarget.ES2015, true);
	let component = getComponent(sourceFile);
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

function getComponent(sourceFile: ts.SourceFile): any {
	let component = new Component();
	let nodes = 0;
	parseNode(sourceFile);
	function parseNode(node: ts.Node) {
		console.log('node kind=', (<any>ts).SyntaxKind[node.kind], '=', node.kind);
		console.log('node text=', node.getText());
		switch (node.kind) {
			case ts.SyntaxKind.ClassDeclaration:
				// console.log('class declaration');
				component.startLineNum = node.getFullStart();
				component.endLineNum = node.getEnd();
				if (node.decorators && node.decorators.length > 0) {
					node.decorators.forEach((decorator: ts.Decorator) => {
						// console.log('decorator', decorator);
						let exp = decorator.expression;
						let decoratorMatch = /\s*(?:component)\s*\((?:['"]{1}(.*)['"]{1})\)/.exec(exp.getText());
						component.name = decoratorMatch[1];
					});
				}
				break;
			case ts.SyntaxKind.Identifier:
				// console.log('identifier', node);
				if (node.parent.kind === ts.SyntaxKind.ClassDeclaration) {
					component.className = (<ts.Identifier>node).getText();
				}
				break;
			case ts.SyntaxKind.PropertyDeclaration:
				// console.log('decorator');
				break;
			case ts.SyntaxKind.MethodDeclaration:
				// console.log('module declaration');
				break;
		};
		nodes++;
		ts.forEachChild(node, parseNode);
	}
	console.log('looped through', nodes, 'nodes');
	return component;
}



// For Testing Purposes
let dataFile = path.join(__dirname, '..', 'src', 'data', 'now-address.ts');
let docFile = path.join(__dirname, 'docs', '*');
start(dataFile, docFile);

// Expose these methods externally
module.exports.start = start;
