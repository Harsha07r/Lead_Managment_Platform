const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedDatabase = async () => {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    return;
  }

  const adminPassword = await bcrypt.hash('Password123!', 10);
  const memberPassword = await bcrypt.hash('Password123!', 10);

  await User.create([
    {
      name: 'Admin User',
      email: 'admin@digitalheroesco.com',
      password: adminPassword,
      role: 'admin',
    },
    {
      name: 'Member User',
      email: 'member@digitalheroesco.com',
      password: memberPassword,
      role: 'member',
    },
  ]);
};

module.exports = { seedDatabase };
