const axios = require('axios');

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema and customer creation...');

    // First, let's try to get existing customers to see if the table structure is correct
    console.log('1. Checking existing customers...');
    try {
      const customersResponse = await axios.get(
        'http://localhost:1310/customers'
      );
      console.log('✅ Customers endpoint accessible');
      console.log(
        'Current customers count:',
        customersResponse.data.data?.length || 0
      );
    } catch (error) {
      console.log(
        '❌ Error accessing customers endpoint:',
        error.response?.data?.EM || error.message
      );
    }

    // Test with a very simple customer creation
    console.log('\n2. Testing simple customer creation...');

    // Create user first
    const userData = {
      first_name: 'Schema',
      last_name: 'Test',
      email: `schema${Date.now()}@test.com`,
      password: 'password123',
      phone: '+1234567890',
      user_type: ['CUSTOMER'],
      address: [],
      is_verified: true
    };

    const userResponse = await axios.post(
      'http://localhost:1310/users',
      userData
    );

    if (userResponse.data.EC !== 0) {
      console.error('❌ Failed to create user:', userResponse.data.EM);
      return;
    }

    const userId = userResponse.data.data.id;
    console.log('✅ User created:', userId);

    // Try minimal customer creation
    const minimalCustomer = {
      user_id: userId,
      first_name: 'Schema',
      last_name: 'Test'
    };

    console.log('Creating minimal customer...');
    const customerResponse = await axios.post(
      'http://localhost:1310/customers',
      minimalCustomer
    );

    if (customerResponse.data.EC === 0) {
      console.log(
        '✅ SUCCESS! Customer created:',
        customerResponse.data.data.id
      );
      console.log('🎉 The customer creation is now working!');
    } else {
      console.log('❌ Customer creation failed:', customerResponse.data.EM);

      // If it's a database constraint error, suggest solution
      if (
        customerResponse.data.EM?.includes('constraint') ||
        customerResponse.data.EM?.includes('last_login')
      ) {
        console.log('\n💡 SOLUTION NEEDED:');
        console.log(
          'The database schema needs to be updated to include the last_login column.'
        );
        console.log('You may need to:');
        console.log('1. Run database migrations');
        console.log(
          '2. Or manually add the last_login column to the customers table'
        );
        console.log('3. Or restart your backend after the entity changes');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);

    if (error.message.includes('ECONNREFUSED')) {
      console.log(
        '\n💡 Backend is not running. Please start it with: npm run start:dev'
      );
    }
  }
}

checkDatabaseSchema();
