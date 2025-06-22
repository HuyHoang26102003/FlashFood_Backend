const axios = require('axios');

async function testMinimalCustomer() {
  try {
    console.log('Testing minimal customer creation...');
    
    // Create a simple user first
    const userData = {
      first_name: 'Test',
      last_name: 'Customer',
      email: `testcust${Date.now()}@test.com`,
      password: 'password123',
      phone: '+1234567890',
      user_type: ['CUSTOMER'],
      address: [],
      is_verified: true
    };

    console.log('Creating user...');
    const userResponse = await axios.post('http://localhost:1310/users', userData);
    
    if (userResponse.data.EC !== 0) {
      console.error('❌ Failed to create user:', userResponse.data.EM);
      return;
    }

    const userId = userResponse.data.data.id;
    console.log('✅ User created with ID:', userId);

    // Create minimal customer - only required fields
    const customerData = {
      user_id: userId,
      first_name: 'Test',
      last_name: 'Customer'
    };

    console.log('Creating minimal customer...');
    console.log('Customer data:', JSON.stringify(customerData, null, 2));
    
    const customerResponse = await axios.post('http://localhost:1310/customers', customerData);
    
    if (customerResponse.data.EC === 0) {
      console.log('✅ Customer created successfully:', customerResponse.data.data.id);
    } else {
      console.error('❌ Failed to create customer:', customerResponse.data.EM);
      console.error('Full response:', customerResponse.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMinimalCustomer(); 
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error(
        'Full error response:',
        JSON.stringify(error.response.data, null, 2)
      );
    }
  }
}

testMinimalCustomer();
