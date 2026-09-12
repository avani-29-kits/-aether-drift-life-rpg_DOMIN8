function notFound(req, res) {
  res.status(404).json({ error: 'Not found.' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const message =
    status < 500 ? err.message : 'Something went wrong. Please try again.';

  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
