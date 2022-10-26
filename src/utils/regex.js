/**
 * It takes a string and returns a regular expression that will match any string that contains all of
 * the words (allowing for a single wildcard between each letter) in the original string, in any order,
 * with any number of characters between them.
 * @param string - The string to be converted to a regex
 * @returns A regular expression that matches the string passed in.
 */
export const fuzzyRegex = (string) => {
	if (!string)
		return {
			$regex: '.*',
			$options: 'si'
		};
	const statement = `${string.split(' ').reduce((prev, curr) => {
		const regex = `(?:.*${curr.split('').join('.?')})[^A-Za-z0-9]?.*`;
		return prev ? `${prev} ${regex}` : regex;
	}, undefined)}`;
	const regex = {
		$regex: statement,
		$options: 'si'
	};
	return regex;
};
