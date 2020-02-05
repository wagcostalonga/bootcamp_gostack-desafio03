module.exports = {
  dialect: 'postgres',
  host: '192.168.99.101',
  username: 'postgres',
  password: '123456',
  database: 'fastfeet',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
