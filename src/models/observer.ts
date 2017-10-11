import { ProgramPart } from './program-part';

export class Observer extends ProgramPart {
	private _properties: string[];
	private _methodName: any;

	get properties() {
		return this._properties;
	}

	set properties(properties) {
		this._properties = properties;
	}

	get methodName() {
		return this._methodName;
	}

	set methodName(methodName) {
		this._methodName = methodName;
	}
	// TODO Fix this
	toMarkup() {
		let observerStr = ''
		observerStr += ':';
		observerStr += this.methodName;
		return observerStr;
	}
}