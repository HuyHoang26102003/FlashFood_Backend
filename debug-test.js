const axios = require('axios');

async function testCustomerCreation() {
  try {
    console.log('Testing customer creation...');

    // First create a user
    const userData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@test.com',
      password: 'password123',
      phone: '+1234567890',
      user_type: ['CUSTOMER'],
      address: [],
      is_verified: true
    };

    console.log('Creating user...');
    const userResponse = await axios.post(
      'http://localhost:1310/users',
      userData
    );
    console.log('User response:', userResponse.data);

    if (userResponse.data.EC !== 0) {
      console.error('Failed to create user:', userResponse.data.EM);
      return;
    }

    const userId = userResponse.data.data.id;
    console.log('Created user with ID:', userId);

    // Now create customer
    const customerData = {
      user_id: userId,
      first_name: 'Test',
      last_name: 'User',
      address_ids: [],
      preferred_category_ids: [],
      favorite_restaurant_ids: [],
      favorite_items: [],
      support_tickets: [],
      app_preferences: {
        theme: 'light'
      },
      restaurant_history: []
    };

    console.log('Creating customer...');
    const customerResponse = await axios.post(
      'http://localhost:1310/customers',
      customerData
    );
    console.log('Customer response:', customerResponse.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testCustomerCreation();
