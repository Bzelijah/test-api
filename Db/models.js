const { connect, Schema, model, pluralize } = require('mongoose');

pluralize(null);

const ratesSchema = new Schema({
  date: String,
  RUB: Object,
  EUR: Object,
  USD: Object,
  JPY: Object,
});

const querySchema = new Schema({
  date: String,
  type: String,
});

module.exports = {
  connect,
  Rate: model('rates', ratesSchema),
  Query: model('queries', querySchema),
};
