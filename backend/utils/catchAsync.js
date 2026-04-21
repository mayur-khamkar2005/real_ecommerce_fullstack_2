module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      console.error('=== CATCHASYNC ERROR ===');
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      console.error('Request method:', req.method);
      console.error('Request URL:', req.originalUrl);
      console.error('Request body:', req.body);
      console.error('========================');
      next(err);
    });
  };
};
