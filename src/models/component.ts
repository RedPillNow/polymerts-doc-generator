import * as fs from 'fs';
import * as htmlParser from 'htmlparser2';
import { ProgramPart } from './program-part';
import { Property } from './property';
import { Observer } from './observer';
import { Behavior } from './behavior';
import { Listener } from './listener';
import { HtmlComment } from './html-comment';

export class Component extends ProgramPart {
	private _behaviors: Behavior[];
	private _className: string;
	private _htmlFilePath: string;
	private _listeners: Listener[];
	private _methods: any[];
	private _name: string;
	private _observers: Observer[];
	private _properties: Property[];

	get behaviors() {
		return this._behaviors || [];
	}

	set behaviors(behaviors) {
		this._behaviors = behaviors;
	}

	get className() {
		return this._className;
	}

	set className(className) {
		this._className = className;
	}

	get htmlFilePath() {
		return this._htmlFilePath;
	}

	set htmlFilePath(htmlFilePath) {
		this._htmlFilePath = htmlFilePath;
	}

	get listeners() {
		return this._listeners || [];
	}

	set listeners(listeners) {
		this._listeners = listeners;
	}

	get methods() {
		return this._methods || [];
	}

	set methods(methods) {
		this._methods = methods;
	}

	get name() {
		return this._name;
	}

	set name(name) {
		this._name = name;
	}

	get observers() {
		return this._observers || [];
	}

	set observers(observers) {
		this._observers = observers;
	}

	get properties() {
		return this._properties || [];
	}

	set properties(properties) {
		this._properties = properties;
	}

	toMarkup() {
		let componentStr = this._writeHtmlComment();
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
	}

	private _writeHtmlComment(): string {
		let comment = null;
		let parser: htmlParser.Parser = new htmlParser.Parser({
			oncomment: (data) => {
				// console.log('_parseHtml parser.oncomment', data);
				if (data.indexOf('@demo') > -1 || data.indexOf('@hero') > -1) {
					comment = new HtmlComment();
					comment.comment = data;
				}
			}
		}, { decodeEntities: true });
		parser.write(fs.readFileSync(this.htmlFilePath));
		parser.end();
		return comment ? comment.toMarkup() : '';
	}

	private _writeHead(): string {
		let headStr = '<dom-module id="' + this.name + '">\n';
		headStr += '\t<template>\n';
		headStr += '\t\t<style></style>\n';
		headStr += '\t\t<script>\n';
		headStr += '(function() {\n';
		headStr += '\tPolymer({\n';
		headStr += '\t\tis: \'' + this.name + '\',';
		return headStr;
	}

	private _writeFoot(): string {
		let footStr = '\n\t});\n';
		footStr += '})();\n';
		footStr += '\t\t</script>\n';
		footStr += '\t</template>\n';
		footStr += '</dom-module>\n';
		return footStr;
	}

	private _writeProperties(): string {
		let propertiesStr = '\n\t\tproperties: {';
		for (let i = 0; i < this.properties.length; i++) {
			let prop: Property = this.properties[i];
			propertiesStr += prop.toMarkup();
			propertiesStr += (i + 1) < this.properties.length ? ',' : '';
		}
		propertiesStr += '\n\t\t},';
		return propertiesStr;
	}

	private _writeBehaviors(): string {
		let behaviorsStr = '\n\t\tbehaviors: [\n';
		for (let i = 0; i < this.behaviors.length; i++) {
			let behavior = this.behaviors[i];
			behaviorsStr += '\t\t\t' + behavior.toMarkup();
			behaviorsStr += (i + 1) < this.behaviors.length ? ',\n' : '';
		}
		behaviorsStr += '\n\t\t],'
		return behaviorsStr;
	}

	private _writeListeners(): string {
		let listenersStr = '\n\t\tlisteners: {\n';
		for (let i = 0; i < this.listeners.length; i++) {
			let listener = this.listeners[i];
			listenersStr += listener.toMarkup();
			listenersStr += (i + 1) < this.listeners.length ? ',\n' : '';
		}
		listenersStr += '\n\t\t},';
		return listenersStr;
	}

	private _writeMethods(): string {
		let methodsStr = '';
		for (let i = 0; i < this.methods.length; i++) {
			let method = this.methods[i];
			methodsStr += '\n' + method.toMarkup();
			methodsStr += (i + 1) < this.methods.length ? ',' : '';
		}
		return methodsStr;
	}

	private _writeObservers(): string {
		let observersStr = '\n\t\tobservers: [\n';
		for (let i = 0; i < this.observers.length; i++) {
			let observer = this.observers[i];
			observersStr += observer.toMarkup();
			observersStr += (i + 1) < this.observers.length ? ',\n' : '';
		}
		observersStr += '\n\t\t\],';
		return observersStr;
	}
}
