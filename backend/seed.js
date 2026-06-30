require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Vehicle = require('./src/models/Vehicle');
const Ride = require('./src/models/Ride');
const Booking = require('./src/models/Booking');
const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ridemate');
    console.log('Database connected successfully.');
    // Clear existing data
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Ride.deleteMany({});
    await Booking.deleteMany({});
    console.log('Collections cleared.');
    // 1. Create Drivers & Passenger
    console.log('Creating user accounts...');
    
    // Driver 1: Karthik Raja (Car)
    const karthik = new User({
      name: 'Karthik Raja',
      email: 'karthik@driver.com',
      phone: '9840123456',
      password: 'password123', // will be hashed automatically by pre-save hook
      profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      role: 'driver',
      rating: 4.8
    });
    await karthik.save();
    // Driver 2: Selvam Kumar (Bike)
    const selvam = new User({
      name: 'Selvam Kumar',
      email: 'selvam@driver.com',
      phone: '9840987654',
      password: 'password123',
      profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      role: 'driver',
      rating: 4.9
    });
    await selvam.save();
    // Passenger: Akshaya Devi
    const akshaya = new User({
      name: 'Akshaya Devi',
      email: 'akshaya@passenger.com',
      phone: '9840112233',
      password: 'password123',
      profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      role: 'passenger',
      rating: 5.0
    });
    await akshaya.save();
    console.log('Users created successfully.');
    // 2. Create Vehicles for Drivers
    console.log('Registering vehicles...');
    
    const karthikCar = await Vehicle.create({
      owner: karthik._id,
      type: 'car',
      number: 'TG 09 BK 8888',
      model: 'Honda Civic (Black)',
      capacity: 4
    });
    const selvamBike = await Vehicle.create({
      owner: selvam._id,
      type: 'bike',
      number: 'TG 07 BY 9999',
      model: 'TVS Jupiter (Grey)',
      capacity: 1
    });
    console.log('Vehicles registered successfully.');
    // 3. Create Ride Commutes
    console.log('Publishing ride commutes...');
    
    // Tomorrow at 9:00 AM
    const tomorrow9am = new Date();
    tomorrow9am.setDate(tomorrow9am.getDate() + 1);
    tomorrow9am.setHours(9, 0, 0, 0);
    // Ride 1: Tambaram to T Nagar (via Chromepet, Guindy)
    const ride1 = await Ride.create({
      driver: karthik._id,
      vehicle: karthikCar._id,
      startLocation: 'Warangal',
      destination: 'Secunderabad',
      routePoints: ['Warangal', 'Jangoan', 'Uppal', 'Secunderabad'],
      departureTime: tomorrow9am,
      costPerSeat: 150,
      availableSeats: 4,
      status: 'active'
    });
    // Ride 2: Guindy to T Nagar (via Saidapet)
    const ride2 = await Ride.create({
      driver: selvam._id,
      vehicle: selvamBike._id,
      startLocation: 'Warangal',
      destination: 'Kazipet',
      routePoints: ['Warangal', 'Hanamkonda', 'Kazipet'],
      departureTime: tomorrow9am,
      costPerSeat: 80,
      availableSeats: 1,
      status: 'active'
    });
    console.log('Ride commutes published successfully.');
    console.log('\nSeeding completed successfully!');
    console.log('--------------------------------------------------');
    console.log('Test Accounts:');
    console.log('1. Passenger: akshaya@passenger.com | Password: password123');
    console.log('2. Driver 1 (Car): karthik@driver.com | Password: password123');
    console.log('3. Driver 2 (Bike): selvam@driver.com | Password: password123');
    console.log('--------------------------------------------------');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error.message);
    mongoose.connection.close();
  }
};
seedData();
