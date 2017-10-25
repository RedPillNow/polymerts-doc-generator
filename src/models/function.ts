import { ProgramPart } from './program-part';

export class Function extends ProgramPart {
	private _methodName: string;
	private _returnType: string;
	private _signature: string;

	get methodName() {
		return this._methodName;
	}

	set methodName(name) {
		this._methodName = name;
	}

	get returnType() {
		return this._returnType;
	}

	set returnType(returnType) {
		this._returnType = returnType;
	}

	get signature() {
		return this._signature;
	}

	set signature(signature) {
		this._signature = signature;
	}

	toMarkup() {
		return '';
	}
}
