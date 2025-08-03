const mongoose = require('mongoose');
const Order = require('./models/Order');
const Service = require('./models/Service');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/servpe', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

async function testOrderCreation() {
  try {
    console.log('Testing order creation...');
    
    // Find a service
    const service = await Service.findOne().populate('freelancer');
    if (!service) {
      console.log('No service found in database');
      return;
    }
    
    console.log('Found service:', service.title);
    console.log('Service pricing plans:', service.pricingPlans);
    
    // Find a user
    const user = await User.findOne();
    if (!user) {
      console.log('No user found in database');
      return;
    }
    
    console.log('Found user:', user.firstName, user.lastName);
    
    // Test order data
    const orderData = {
      orderNumber: `TEST${Date.now()}`,
      conversationId: `test_${Date.now()}`,
      client: user._id,
      freelancer: service.freelancer._id,
      service: service._id,
      selectedPlan: 'basic',
      requirements: 'Test requirements',
      requirementFiles: [],
      addOns: [],
      totalAmount: service.pricingPlans.basic.price,
      platformFee: service.pricingPlans.basic.price * 0.1,
      freelancerEarnings: service.pricingPlans.basic.price * 0.9,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'pending'
    };
    
    console.log('Creating test order with data:', orderData);
    
    const order = await Order.create(orderData);
    console.log('Test order created successfully:', order._id);
    
    // Clean up
    await Order.findByIdAndDelete(order._id);
    console.log('Test order cleaned up');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testOrderCreation(); 