import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import CarListing from '../models/CarListing.js';

// Load environment variables
dotenv.config();

// Check cars in database
async function checkCars() {
  try {
    // Connect to database
    await connectDB();
    
    const cars = await CarListing.find({});
    console.log('Total cars in database:', cars.length);
    
    const verifiedCars = cars.filter(car => car.status === 'Verified');
    console.log('Verified cars:', verifiedCars.length);
    
    const pendingCars = cars.filter(car => car.status === 'Pending');
    console.log('Pending cars:', pendingCars.length);
    
    const rejectedCars = cars.filter(car => car.status === 'Rejected');
    console.log('Rejected cars:', rejectedCars.length);
    
    if (verifiedCars.length > 0) {
      console.log('\nSample verified cars:');
      verifiedCars.slice(0, 3).forEach(car => {
        console.log(`- ${car.title} (${car.brand} ${car.model}) - ₹${car.price}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking cars:', error);
    process.exit(1);
  }
}

checkCars();