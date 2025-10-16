import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test if we can create a simple document
    const Test = mongoose.model('Test', new mongoose.Schema({ name: String }));
    await Test.create({ name: 'test' });
    console.log('✅ Database operations working!');
    
    await mongoose.connection.close();
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error details:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n💡 Solution: MongoDB is not running. Please start MongoDB service.');
    } else if (error.name === 'MongoParseError') {
      console.log('\n💡 Solution: Connection string format is invalid.');
    } else if (error.name === 'AuthenticationFailed') {
      console.log('\n💡 Solution: Database authentication failed. Check username/password.');
    }
  }
}

testConnection();