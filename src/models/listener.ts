import { ProgramPart } from './program-part';

export class Listener extends ProgramPart {
	private _elementId: string;
	private _eventName: string;
	private _eventDeclaration: string;
	private _methodName: any;

	get elementId() {
		return this._elementId;
	}

	set elementId(elementId) {
		this._elementId = elementId;
	}

	get eventDeclaration() {
		return this._eventDeclaration;
	}

	set eventDeclaration(eventDeclaration) {
		this._eventDeclaration = eventDeclaration;
	}

	get eventName() {
		return this._eventName;
	}

	set eventName(name) {
		this._eventName = name;
	}

	get methodName() {
		return this._methodName;
	}

	set methodName(methodName) {
		this._methodName = methodName;
	}

	toMarkup() {
		let listenerStr = '\n' + this.comment.toMarkup();
		listenerStr += '\n"' + this.eventName + '"';
		listenerStr += ': ';
		listenerStr += '"' + this.methodName + '"';
		return listenerStr;
	}
}