import {handleErr, handleNotFound} from '../utils';
import {sheetMap, sheetReader} from '../utils/googleSheets';

export const getStaticPage = async (req, res) => {
  const {pageId} = req?.params;
  const sheetId = sheetMap?.[pageId];

  if (!sheetId) {
    return handleNotFound(res);
  }

  await sheetReader(sheetId)
    .then((sheet) => {
      return res.json({page: sheet});
    })
    .catch((err) => handleErr(err, res));
};
