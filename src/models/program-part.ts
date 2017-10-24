import { Comment } from './comment';

export abstract class ProgramPart {
	private _comment: Comment;
	private _startLineNum: number;
	private _endLineNum: number;

	abstract toMarkup(): string;

	get comment() {
		return this._comment;
	}

	set comment(comment) {
		this._comment = comment;
	}

	get endLineNum() {
		return this._endLineNum;
	}

	set endLineNum(endLineNum) {
		this._endLineNum = endLineNum;
	}

	get startLineNum() {
		return this._startLineNum;
	}

	set startLineNum(startLineNum) {
		this._startLineNum = startLineNum;
	}
}
