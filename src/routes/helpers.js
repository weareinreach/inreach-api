import axios from 'axios';

export const url = 'https://api.geoapify.com/v1/geocode/search';
const apiKey = process.env.GEOAPIFY_KEY;

export const getCoords = async (req, res) => {
	const {query} = req;

	console.log('Coord Fetch called.');
	const {data} = await axios.get(url, {
		params: {
			text: query.text,
			apiKey: apiKey,
			format: 'json'
		}
	});

	res.json({lat: data.results[0].lat, lon: data.results[0].lon});
};
