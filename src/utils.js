import {google} from 'googleapis';
import jwt from 'jsonwebtoken';
import _omit from 'lodash/omit';
import _orderBy from 'lodash/orderBy';
import _set from 'lodash/set';
import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;
const TOKEN_SIGNATURE = process.env.TOKEN_SIGNATURE || 'ssshhh';

export const formatService = (service, org) => {
  // eslint-disable-next-line no-unused-vars
  const {services, ...restOrg} = org;
  const formattedService = {
    ...service,
    organization: {...restOrg},
  };

  return formattedService;
};

export const orderServices = (services) => {
  // TODO: places orgs with no value first
  return _orderBy(services, ['updated_at'], ['desc']);
};

/**
 * Uses object shorthand to create a query based on if the values exist
 * @param  {String} organizationId id of the organization
 * @param  {String} serviceId id of the service
 * @return {Object} A mongo query for entity fields
 */
export const getEntityQuery = ({organizationId, serviceId} = {}) => {
  const query = {};

  if (organizationId) {
    query.organizationId = organizationId;
  }

  if (serviceId) {
    query.serviceId = serviceId;
  }

  return query;
};

export const ITEM_PAGE_LIMIT = 20;

export const parsePageQuery = (page = '1') => {
  const parsedPage = parseInt(page);
  const limit = ITEM_PAGE_LIMIT;
  const offset = limit * (parsedPage - 1);

  return {limit, offset};
};

/**
 * Format a query to retrieve organizations
 * @param  {Object} name Name of organation
 * @param  {Object} page Page to retrieve
 * @param  {Object} properties Properties to search on
 * @return {Object} A mongo query for organizations
 */
export const getOrganizationQuery = (params = {}) => {
  const {
    ids,
    name,
    owner,
    page = '1',
    pending,
    pendingOwnership,
    properties,
    tagLocale,
    tags,
  } = params;
  const {limit, offset} = parsePageQuery(page);
  let query = {};

  if (ids) {
    query._id = {
      $in: ids.split(',').map((id) => new ObjectId(id)),
    };
  }

  if (owner) {
    query['owners.email'] = owner;
  }

  if (pendingOwnership) {
    query['owners.isApproved'] = false;
  }

  if (name) {
    query.$text = {$search: name};
  }

  if (pending) {
    query.is_published = false;
  } else {
    query.is_published = true;
  }

  const queryOnProperties = properties;
  const queryOnTags = tagLocale && tags;

  // For querying on an organizations services
  if (queryOnProperties || queryOnTags) {
    let props = {};

    if (queryOnProperties) {
      props = properties.split(',').reduce((result, prop) => {
        const [name, value] = prop.split('=');

        result[`properties.${name}`] = value;

        return result;
      }, props);
    }

    if (tagLocale && tags) {
      const tagList = tags.split(',');

      props[`tags.${tagLocale}`] = {$in: tagList};
    }

    query.services = {$elemMatch: props};
  }

  return {params: {limit, offset}, query};
};

/**
 * Returns a 400 status
 * @param  {Object} res express response object
 * @return {???} Returns the express function
 */
export const handleBadRequest = (res) => {
  return res.status(400).json({error: true});
};

/**
 * Returns a 404 status
 * @param  {Object} res express response object
 * @return {???} Returns the express function
 */
export const handleNotFound = (res) => {
  return res.status(404).json({notFound: true});
};

/**
 * Logs the error and then return a 500 status
 * @param  {Object} err an error object
 * @param  {Object} res express response object
 * @return {???} Returns the express function
 */
export const handleErr = (err, res) => {
  // eslint-disable-next-line
  console.error(err);

  return res.status(500).json({error: true});
};

/**
 * Remove sensitive user information
 * @param  {Object} user User info
 * @return {Object} Sanitized user info
 */
export const removeUserInfo = (user) => {
  return _omit(user, ['hash', 'password', 'salt']);
};

/**
 * Generate a JWT with user information
 * @param  {Object} user
 * @return {String} jwt
 */
export const generateJWT = (user) => {
  const today = new Date();
  const expDate = new Date(today);

  expDate.setDate(today.getDate() + 14);

  return jwt.sign(
    {
      ...user,
      exp: parseInt(expDate.getTime() / 1000),
    },
    TOKEN_SIGNATURE
  );
};

/**
 * Verify JWT
 * @param  {String} token Token to verify
 * @return {Promise} Returns a promise since jwt.verify is async
 */
export const verifyJWT = (token) => {
  return new Promise((resolve) => {
    jwt.verify(token, TOKEN_SIGNATURE, (err, decoded) => {
      if (err) {
        resolve({valid: false});
      }

      resolve({user: decoded, valid: true});
    });
  });
};

/**
 * A map of url paths to google sheets
 * @type {Object}
 */
export const sheetMap = {
  international: '1SpeBICjrlU0b0U18i46RLjjDAwUNqo-5dRoITi6OWhE',
  'outside-us-and-canada': '1SpeBICjrlU0b0U18i46RLjjDAwUNqo-5dRoITi6OWhE',
  mexico: '1yYv-Wi0cke0zzgwFmtiBSydF1H-6eoQ_BBCZbAafV8s',
};

class SheetsReader {
  constructor(key, id) {
    this.sheets = google.sheets({
      version: 'v4',
      auth: key,
    });
    this.id = id;
  }

  getTabs() {
    return this.sheets.spreadsheets
      .get({
        spreadsheetId: this.id,
      })
      .then((res) => res.data.sheets);
  }

  getRows(tab) {
    const range = `${tab.properties.title}!A1:${this._columnToLetter(
      tab.properties.gridProperties.columnCount
    )}${tab.properties.gridProperties.rowCount}`;

    return this.sheets.spreadsheets.values
      .get({
        spreadsheetId: this.id,
        range,
      })
      .then((res) => res?.data?.values);
  }

  _columnToLetter(column) {
    let letter = '';
    let temp = '';

    while (column > 0) {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }
    return letter;
  }
}

const formatTabRows = (tab, rows) => {
  const regex = /\[([^\]]*)\]/gm;
  const ARRAY_PLACEHOLDER = '~~';

  rows.map((row) => {
    let identifier = row[0];
    let identifierRoot = identifier.replace(regex, '');
    let path = [identifierRoot];

    if (identifierRoot !== identifier) {
      let match;

      while ((match = regex.exec(identifier)) !== null) {
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        if (match[1].length === 0) {
          path.push(ARRAY_PLACEHOLDER);
        } else {
          path.push(match[1]);
        }
      }
    }
    for (var i = 1; i < row.length; i++) {
      let updatedPath = path.map((value) => {
        if (value == ARRAY_PLACEHOLDER) {
          return (i - 1).toString();
        } else {
          return value;
        }
      });
      _set(tab, updatedPath.join('.'), row[i]);
    }
  });

  return tab;
};

/**
 * Fetches the sheet from google
 * @param  {String} sheetId
 * @return {Array} A list of the data in each tab
 */
export const sheetReader = (sheetId) => {
  const sheetsReader = new SheetsReader(process.env.SHEETS_API_KEY, sheetId);

  return sheetsReader.getTabs().then((tabs) => {
    return Promise.all(
      tabs.map((tab) => {
        let tabData = {
          heading: tab.properties.title,
        };

        return sheetsReader
          .getRows(tab)
          .then((rows) => formatTabRows(tabData, rows));
      })
    );
  });
};
