import { ProgramPart } from './program-part';
import { Property } from './property';
import { Observer } from './observer';
// import { Behavior } from './behavior';
import { Listener } from './listener';

export class Component extends ProgramPart {
	private _listeners: Listener[];
	private _methods: any[];
	private _name: string;
	private _observers: Observer[];
	private _properties: Property[];

	get listeners() {
		return this._listeners;
	}

	set listeners(listeners) {
		this._listeners = listeners;
	}

	get methods() {
		return this._methods;
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
		return this._observers;
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
		let componentStr = '<dom-module id="' + this.name + '">\n';
		componentStr += '\t<template>\n';
		componentStr += '\t\t<style></style>\n';
		componentStr += '\t\t<script>\n';
		componentStr += '(function() {\n';
		componentStr += '\tPolymer({\n';
		componentStr += '\t\tis: "' + this.name + '",\n';
		componentStr += this._writeProperties();
		// TODO parse all the different parts here

		componentStr += '\t});\n';
		componentStr += '})();\n';
		componentStr += '\t\t</script>\n';
		componentStr += '\t</template>\n';
		componentStr += '</dom-module>\n';
		return componentStr;
	}

	private _writeProperties(): string {
		let propertiesStr = '\t\tproperties: {';
		for (let i = 0; i < this.properties.length; i++) {
			let prop: Property = this.properties[i];
			propertiesStr += '\t\t\t' + prop.toMarkup();
			if (i < (this.properties.length - 1)) {
				propertiesStr += ',';
			}
		}
		propertiesStr += '\t\t},'
		return propertiesStr;
	}
}
