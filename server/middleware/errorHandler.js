module.exports = (err, req, res, next) => {
  console.error('API Error:', err.message || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
