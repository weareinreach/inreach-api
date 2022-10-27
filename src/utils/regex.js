/**
 * It takes a string and returns a regex that matches the string with any number of words in between
 * Within each word, one "non-word (no letters, numbers, or underscore)" character is allowed
 * @param string - The string to be converted to a regex.
 * @returns A regular expression object for Mongoose search.
 */
export const fuzzyRegex = (string) => {
	if (!string)
		return {
			$regex: '.*',
			$options: 'si'
		};
	const statement = `${string.split(' ').reduce((prev, curr) => {
		const escapedWord = curr.split('').reduce((prev, curr) => {
			return prev ? `${prev}\\W?\\Q${curr}\\E` : `\\Q${curr}\\E`;
		}, undefined);

		const wordRegex = `(?:.*${escapedWord})\\W?.*`;
		return prev ? `${prev} ${wordRegex}` : wordRegex;
	}, undefined)}`;
	const regex = {
		$regex: statement,
		$options: 'si'
	};
	return regex;
};
