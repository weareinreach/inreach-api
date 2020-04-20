import {google} from 'googleapis';
import _set from 'lodash/set';

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
