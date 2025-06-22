const axios = require('axios');

async function testCustomerCreation() {
  try {
    console.log('=== Testing Customer Creation ===');

    // Create user first
    const userData = {
      first_name: 'John',
      last_name: 'Doe',
      email: `test${Date.now()}@test.com`,
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

    if (userResponse.data.EC !== 0) {
      console.error('❌ Failed to create user:', userResponse.data.EM);
      return;
    }

    const userId = userResponse.data.data.id;
    console.log('✅ User created with ID:', userId);

    // Create customer
    const customerData = {
      user_id: userId,
      first_name: 'John',
      last_name: 'Doe',
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

    if (customerResponse.data.EC === 0) {
      console.log(
        '✅ Customer created successfully:',
        customerResponse.data.data.id
      );
    } else {
      console.error('❌ Failed to create customer:', customerResponse.data.EM);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testDriverCreation() {
  try {
    console.log('\n=== Testing Driver Creation ===');

    // Create user first
    const userData = {
      first_name: 'Mike',
      last_name: 'Driver',
      email: `driver${Date.now()}@test.com`,
      password: 'password123',
      phone: '+1234567891',
      user_type: ['DRIVER'],
      address: [],
      is_verified: true
    };

    console.log('Creating driver user...');
    const userResponse = await axios.post(
      'http://localhost:1310/users',
      userData
    );

    if (userResponse.data.EC !== 0) {
      console.error('❌ Failed to create driver user:', userResponse.data.EM);
      return;
    }

    const userId = userResponse.data.data.id;
    console.log('✅ Driver user created with ID:', userId);

    // Create driver
    const driverData = {
      user_id: userId,
      first_name: 'Mike',
      last_name: 'Driver',
      email: `driver${Date.now()}@test.com`,
      phone: '+1234567891',
      vehicle_info: {
        type: 'MOTORBIKE',
        license_plate: 'ABC123',
        model: 'Honda',
        color: 'Red'
      },
      location: {
        lat: 10.762622,
        lng: 106.660172
      },
      status: {
        is_active: true,
        is_available: true,
        is_verified: true
      },
      rating: {
        average_rating: 4.5,
        total_rating: 100
      }
    };

    console.log('Creating driver...');
    const driverResponse = await axios.post(
      'http://localhost:1310/drivers',
      driverData
    );

    if (driverResponse.data.EC === 0) {
      console.log(
        '✅ Driver created successfully:',
        driverResponse.data.data.id
      );
    } else {
      console.error('❌ Failed to create driver:', driverResponse.data.EM);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testRestaurantCreation() {
  try {
    console.log('\n=== Testing Restaurant Creation ===');

    const restaurantData = {
      owner_id: 'test-owner-id',
      owner_name: 'Restaurant Owner',
      restaurant_name: 'Test Restaurant',
      description: 'A test restaurant',
      contact_email: [
        {
          title: 'Primary',
          is_default: true,
          email: 'restaurant@test.com'
        }
      ],
      contact_phone: [
        {
          title: 'Primary',
          number: '+1234567892',
          is_default: true
        }
      ],
      status: {
        is_open: true,
        is_active: true,
        is_accepted_orders: true
      },
      opening_hours: {
        mon: { from: 28800, to: 79200 },
        tue: { from: 28800, to: 79200 },
        wed: { from: 28800, to: 79200 },
        thu: { from: 28800, to: 79200 },
        fri: { from: 28800, to: 79200 },
        sat: { from: 28800, to: 79200 },
        sun: { from: 28800, to: 79200 }
      }
    };

    console.log('Creating restaurant...');
    const restaurantResponse = await axios.post(
      'http://localhost:1310/restaurants',
      restaurantData
    );

    if (restaurantResponse.data.EC === 0) {
      console.log(
        '✅ Restaurant created successfully:',
        restaurantResponse.data.data.id
      );
    } else {
      console.error(
        '❌ Failed to create restaurant:',
        restaurantResponse.data.EM
      );
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function runTests() {
  await testCustomerCreation();
  await testDriverCreation();
  await testRestaurantCreation();

  console.log('\n=== Test Complete ===');
}

runTests();
