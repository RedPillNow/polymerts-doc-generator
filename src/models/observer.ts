import { ProgramPart } from './program-part';

export class Observer extends ProgramPart {
	private _properties: string[];
	private _methodName: any;

	get properties(): string[] {
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
		let comment = this.comment ? this.comment.toMarkup() : '';
		let observerStr = comment;
		observerStr += '\t\t\t\'' + this.methodName + '(';
		for (let i = 0; i < this.properties.length; i++) {
			let prop = this.properties[i];
			observerStr += prop;
			observerStr += (i + 1) < this.properties.length ? ',' : '';
		}
		observerStr += ')\'';
		return observerStr;
	}
}