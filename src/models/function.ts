import { ProgramPart } from './program-part';

export class Function extends ProgramPart {
	private _methodName: string;
	private _parameters: string[];
	private _returnType: string;
	private _signature: string;

	get methodName() {
		return this._methodName;
	}

	set methodName(methodName) {
		this._methodName = methodName;
	}

	get parameters() {
		return this._parameters || [];
	}

	set parameters(parameters) {
		this._parameters = parameters || [];
	}

	get returnType() {
		return this._returnType;
	}

	set returnType(returnType) {
		this._returnType = returnType;
	}

	get signature() {
		if (!this._signature && this.methodName && this.parameters) {
			this._signature = this.methodName + '(';
			for (let i = 0; i < this.parameters.length; i++) {
				this._signature += this.parameters[i];
				this._signature += (i + 1) < this.parameters.length ? ', ' : '';
			}
			this._signature += ') {}';
		}
		return this._signature;
	}

	set signature(signature) {
		this._signature = signature;
	}

	toMarkup() {
		let comment = this.comment ? this.comment.toMarkup() : '';
		let functionStr = comment;
		functionStr += '\t\t' + this.signature;
		return functionStr;
	}
}
