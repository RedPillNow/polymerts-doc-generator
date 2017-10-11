export module Utils {

	export function trimRight(str) {
		return str.replace(/\s+$/, '');
	}

	export function trimTabs(str) {
		return str.replace(/\t+/g, '');
	}

}
