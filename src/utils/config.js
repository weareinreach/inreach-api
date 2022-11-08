// Dev/Staging config is the base
const base = {
	tokenSignature: process.env.TOKEN_SIGNATURE || 'ssshhh'
};

export const getControlPanelBaseUrl = () => {
	switch (true) {
		case process.env.VERCEL_ENV === 'production':
			return 'https://admin.inreach.org';
		case process.env.VERCEL_ENV === 'preview':
			return 'https://inreach-admin-v1-git-dev-weareinreach.vercel.app';
		default:
			return 'http://localhost';
	}
};

const local = {};

const prod = {};

const env = process.env.APP_ENV;

export default {
	...base,
	...(env === 'local' ? local : {}),
	...(env === 'production' ? prod : {})
};
