// src/middlewares/validation.js
function requireValueField(req, res, next) {
  const { value } = req.body || {};
  if (value === undefined) {
    return res.status(400).json({ message: 'Missing "value" field' });
  }
  if (typeof value !== 'string') {
    return res.status(422).json({ message: '"value" must be a string' });
  }
  next();
}

export default { requireValueField };
