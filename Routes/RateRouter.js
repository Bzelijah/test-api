const router = require('express').Router();
const { Rate, Query } = require('../Db/models');
const checkAuth = require('../Middleware/ApiKeyAuth');


router.get('/convert/:fromto/apiKey=:apikey', checkAuth, async (req, res) => {
  if (req.path.length > 260) {
    return res.sendStatus(500)
  }

  let { fromto } = req.params;
  fromto = fromto.toUpperCase().split('-');
  let from = fromto[0];
  let to = fromto[1];
  let date = new Date();
  try {
    date = `${date.getFullYear()}-${Number(date.getMonth() + 1) < 10 ? '0' : ''}${date.getMonth() + 1}-${date.getDate()}`;
    const rate = await Rate.findOne({ date });
    await Query.create({ date, type: fromto.join() })
    if (rate) {
      return res.json({ from: rate[from][from], to: rate[from][to] });
    } else {
      return res.sendStatus(500);
    }
  } catch (error) {
    console.log(error);
  }
  return res.sendStatus(501);
});

router.get('/:date/apiKey=:apikey', checkAuth, async (req, res) => {
  if (req.path.length > 260) {
    return res.sendStatus(500)
  }

  const { date } = req.params;
  let currentDate = new Date();
  currentDate = `${currentDate.getFullYear()}-${Number(currentDate.getMonth() + 1) < 10 ? '0' : ''}${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

  await Query.create({ date: currentDate, type: 'Date' })
  try {
    const rate = await Rate.findOne({ date });
    return res.status(200).json(rate.RUB)
  } catch (error) {
    console.log(error);
  }

  return res.sendStatus(500);
});


module.exports = {
  rateRouter: router,
};
