import { ProgramPart } from './program-part';

export class Listener extends ProgramPart {
	private _name: string;
	private _methodName: any;

	get name() {
		return this._name;
	}

	set name(name) {
		this._name = name;
	}

	get methodName() {
		return this._methodName;
	}

	set methodName(methodName) {
		this._methodName = methodName;
	}

	toMarkup() {
		let listenerStr = '\n' + this.comment.toMarkup();
		listenerStr += '\n"' + this.name + '"';
		listenerStr += ': ';
		listenerStr += '"' + this.methodName + '"';
		return listenerStr;
	}
}