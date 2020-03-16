export const serviceDelete = async (req, res) => {
  res.json({serviceDelete: true});
};

export const serviceGet = async (req, res) => {
  res.json({serviceGet: true});
};

export const servicesCreate = async (req, res) => {
  res.json({servicesCreate: true});
};

export const servicesGet = async (req, res) => {
  // TODO: pagination and other query params
  res.json({servicesGet: true});
};

export const serviceUpdate = async (req, res) => {
  res.json({serviceUpdate: true});
};
