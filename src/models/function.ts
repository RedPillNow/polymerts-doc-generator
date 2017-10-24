import { ProgramPart } from './program-part';

export class Function extends ProgramPart {
	private _signature: string;

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
