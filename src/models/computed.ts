import { Property } from './property';

export class ComputedProperty extends Property {
	private _methodName: any;

	get methodName() {
		return this._methodName;
	}

	set methodName(methodName) {
		this._methodName = methodName;
	}

	toMarkup() {
		let listenerStr = this.name;
		listenerStr += ':';
		listenerStr += this.methodName;
		return listenerStr;
	}
}