// Юзер, по чьему апи ключу будем обращаться на ручки.

const user = {
  name: 'user',
  apiKey: 123
}

function checkAuth(req, res, next) {
  const { apikey } = req.params;
  if (Number(apikey) === user.apiKey) {
    next();
  } else {
    return res.sendStatus(515);
  }
}

module.exports = checkAuth;
