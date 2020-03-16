export const userDelete = async (req, res) => {
  res.json({userDelete: true});
};
export const userFavoritesUpdate = async (req, res) => {
  res.json({userFavoritesUpdate: true});
};

export const userGet = async (req, res) => {
  // TODO: do not return emails
  res.json({userGet: true});
};

export const usersCreate = async (req, res) => {
  res.json({usersCreate: true});
};

export const usersGet = async (req, res) => {
  // TODO: pagination and query
  // TODO: do not return emails
  res.json({usersGet: true});
};

export const userUpdate = async (req, res) => {
  res.json({userUpdate: true});
};
