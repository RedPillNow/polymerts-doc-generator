import { Comment } from './comment';
import * as ts from 'typescript';

export abstract class ProgramPart {
	private _comment: Comment;
	private _endLineNum: number;
	private _startLineNum: number;
	private _tsNode: ts.Node;

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

	get tsNode() {
		return this._tsNode;
	}

	set tsNode(tsNode) {
		this._tsNode = tsNode;
	}
}
