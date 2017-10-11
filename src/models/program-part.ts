import { Comment } from './comment';

export abstract class ProgramPart {
	private _comment: Comment;

	abstract toMarkup(): string;

	get comment() {
		return this._comment;
	}

	set comment(comment) {
		this._comment = comment;
	}
}
