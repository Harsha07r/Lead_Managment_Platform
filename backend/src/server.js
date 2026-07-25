const { app } = require('./app');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('./seeders/seed');

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('Environment variable JWT_SECRET is required. Set it in backend/.env or your hosting provider.');
  process.exit(1);
}

connectDB()
  .then(() => seedDatabase())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Startup failed:', error.message);
    process.exit(1);
  });
