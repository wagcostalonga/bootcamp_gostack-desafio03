import Sequelize, { Model } from 'sequelize';

class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        street: Sequelize.STRING,
        number: Sequelize.INTEGER,
        complement: Sequelize.STRING,
        city: Sequelize.STRING,
        state: Sequelize.STRING,
        postcode: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'recipient',
      }
    );
    return this;
  }
}

export default Recipient;
