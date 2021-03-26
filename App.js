const express = require('express');
const fetch = require('node-fetch');
const { connect, Rate } = require('./Db/models');

const { rateRouter } = require('./Routes/RateRouter');
const app = express();

let date;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/rate', rateRouter);

// Используем для того, чтобы засеять базу несколькими значениями.

seeder();

function seeder() {
  async function saver(date) {
    const response = await fetch(`https://currate.ru/api/?get=rates&pairs=USDRUB,EURRUB,JPYRUB,RUBUSD,EURUSD,JPYUSD,RUBEUR,USDEUR,JPYEUR,RUBJPY,USDJPY,EURJPY&date=${date}&key=977a8a91fa7d231a23c6133f29852792`);
    const day = await response.json();
    prepareAndSaveInDB(day, date);
  }

  saver('2018-02-12T15:00:00');
  saver('2018-04-12T15:00:00');
  saver('2018-07-12T15:00:00');
};


async function prepareAndSaveInDB(obj, date) {
  date = date.split('T')[0];
  const pairs = Object.entries(obj.data)
  const RUB = {};
  const USD = {};
  const EUR = {};
  const JPY = {};

  for (let i = 0; i < pairs.length; i++) {
    if (i <= 2) {
      RUB[pairs[i][0].slice(0, 3)] = Number(pairs[i][1]);
    } else if (i >= 3 && i <= 5) {
      USD[pairs[i][0].slice(0, 3)] = Number(pairs[i][1]);
    } else if (i >= 6 && i <= 8) {
      EUR[pairs[i][0].slice(0, 3)] = Number(pairs[i][1]);
    } else {
      JPY[pairs[i][0].slice(0, 3)] = Number(pairs[i][1]);
    }
  }

  RUB.RUB = 1;
  USD.USD = 1;
  EUR.EUR = 1;
  JPY.JPY = 1;

  const rates = new Rate({
    date, RUB, USD, EUR, JPY
  })
  await rates.save();
}



setInterval(async () => {
  date = new Date();
  date = `${date.getFullYear()}-${Number(date.getMonth() + 1) < 10 ? '0' : ''}${date.getMonth() + 1}-${date.getDate()}`;
  try {
    const rate = await Rate.find({ date })
    if (!rate.length) {
      const response = await fetch('https://currate.ru/api/?get=rates&pairs=USDRUB,EURRUB,JPYRUB,RUBUSD,EURUSD,JPYUSD,RUBEUR,USDEUR,JPYEUR,RUBJPY,USDJPY,EURJPY&key=977a8a91fa7d231a23c6133f29852792');
      const newRate = await response.json();

      prepareAndSaveInDB(newRate, date);
    }
  } catch (error) {
    console.log(error);
  }
}, 5000);

app.listen(3000, async () => {
  console.log('Сервер запущен.');
  connect('mongodb://localhost/rates', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }, () => {
    console.log('Подключение к базе данных успешно.')
  })
});

