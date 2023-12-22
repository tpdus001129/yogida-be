export default function validator(schema) {
  return async function (req, res, next) {
    try {
      const validated = await schema.validateAsync(req.body);
      req.body = validated;
      next();
    } catch (err) {
      if (err.isJoi) next(err.message);
      next(err);
    }
  };
}
