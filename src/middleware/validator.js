export default function validator(schema) {
  return async function (req, res, next) {
    try {
      const validated = await schema.validateAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = validated.body;
      req.query = validated.query;
      req.params = validated.params;

      next();
    } catch (err) {
      if (err.isJoi) next(err);
      next(err);
    }
  };
}
