const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Adjust this to your backend URL
const FAKE_ENDPOINTS = {
  customers: `${BASE_URL}/customers-fake`,
  restaurants: `${BASE_URL}/restaurants-fake`,
  customerCares: `${BASE_URL}/customer-cares-fake`
};

// Fake data generators
function generateFakeCustomers(count = 10) {
  const customers = [];

  for (let i = 1; i <= count; i++) {
    customers.push({
      user_id: `user-customer-${i}`,
      first_name: `Customer${i}`,
      last_name: `Test${i}`,
      address: `123 Main St, City ${i}`,
      avatar: {
        url: `https://randomuser.me/api/portraits/men/${i}.jpg`,
        key: `avatar-customer-${i}`
      },
      address_ids: [],
      preferred_category_ids: [],
      favorite_restaurant_ids: [],
      favorite_items: [],
      support_tickets: [],
      app_preferences: {
        theme: 'LIGHT'
      },
      restaurant_history: [],
      created_at: Date.now(),
      updated_at: Date.now()
    });
  }

  return customers;
}

function generateFakeRestaurants(count = 10) {
  const restaurants = [];

  for (let i = 1; i <= count; i++) {
    restaurants.push({
      owner_id: `user-restaurant-owner-${i}`,
      owner_name: `Owner ${i}`,
      address_id: `address-${i}`,
      restaurant_name: `Restaurant ${i}`,
      description: `A wonderful restaurant serving delicious food. Restaurant ${i} specializes in various cuisines.`,
      contact_email: [
        {
          title: 'Main Contact',
          is_default: true,
          email: `restaurant${i}@example.com`
        }
      ],
      contact_phone: [
        {
          title: 'Main Phone',
          number: `+1234567${String(i).padStart(3, '0')}`,
          is_default: true
        }
      ],
      avatar: {
        url: `https://picsum.photos/200/200?random=${i}`,
        key: `avatar-restaurant-${i}`
      },
      images_gallery: [
        {
          url: `https://picsum.photos/300/200?random=${i + 100}`,
          key: `gallery-restaurant-${i}-1`
        }
      ],
      status: {
        is_open: true,
        is_active: true,
        is_accepted_orders: true
      },
      promotions: [],
      ratings: {
        average_rating: 4.0 + Math.random() * 1.0,
        review_count: Math.floor(Math.random() * 100) + 10
      },
      food_category_ids: [],
      opening_hours: {
        mon: { from: 9, to: 22 },
        tue: { from: 9, to: 22 },
        wed: { from: 9, to: 22 },
        thu: { from: 9, to: 22 },
        fri: { from: 9, to: 23 },
        sat: { from: 10, to: 23 },
        sun: { from: 10, to: 21 }
      }
    });
  }

  return restaurants;
}

function generateFakeCustomerCares(count = 5) {
  const customerCares = [];

  for (let i = 1; i <= count; i++) {
    customerCares.push({
      user_id: `user-care-${i}`,
      contact_email: [
        {
          title: 'Work Email',
          is_default: true,
          email: `care${i}@flashfood.com`
        }
      ],
      contact_phone: [
        {
          title: 'Work Phone',
          number: `+1234567${String(800 + i).padStart(3, '0')}`,
          is_default: true
        }
      ],
      first_name: `Care${i}`,
      last_name: `Support${i}`,
      assigned_tickets: [],
      created_at: Date.now(),
      updated_at: Date.now(),
      last_login: Date.now() - Math.random() * 86400000, // Random last login within 24 hours
      avatar: {
        key: `avatar-care-${i}`,
        url: `https://randomuser.me/api/portraits/women/${i}.jpg`
      },
      available_for_work: true,
      is_assigned: false
    });
  }

  return customerCares;
}

// Function to send data to endpoints
async function sendDataToEndpoint(endpoint, data, entityName) {
  try {
    console.log(`Sending ${data.length} ${entityName} records...`);

    for (let i = 0; i < data.length; i++) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data[i])
      });

      if (response.ok) {
        console.log(`✅ ${entityName} ${i + 1} created successfully`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed to create ${entityName} ${i + 1}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error sending ${entityName} data:`, error.message);
  }
}

// Alternative bulk function (if your endpoints support it)
async function sendBulkDataToEndpoint(endpoint, data, entityName) {
  try {
    console.log(`Sending ${data.length} ${entityName} records in bulk...`);

    const response = await fetch(`${endpoint}/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(
        `✅ ${data.length} ${entityName} records created successfully`
      );
    } else {
      const error = await response.text();
      console.log(`❌ Failed to create ${entityName} records:`, error);
      // Fallback to individual requests
      console.log(`Falling back to individual requests...`);
      await sendDataToEndpoint(endpoint, data, entityName);
    }
  } catch (error) {
    console.error(`Error sending bulk ${entityName} data:`, error.message);
    // Fallback to individual requests
    console.log(`Falling back to individual requests...`);
    await sendDataToEndpoint(endpoint, data, entityName);
  }
}

// Main function
async function populateDatabase() {
  console.log('🚀 Starting fake data generation...\n');

  // Generate fake data
  const customers = generateFakeCustomers(15);
  const restaurants = generateFakeRestaurants(12);
  const customerCares = generateFakeCustomerCares(6);

  console.log(`Generated:
  - ${customers.length} customers
  - ${restaurants.length} restaurants
  - ${customerCares.length} customer care agents\n`);

  // Send data to endpoints
  await sendBulkDataToEndpoint(
    FAKE_ENDPOINTS.customers,
    customers,
    'customers'
  );
  console.log('');

  await sendBulkDataToEndpoint(
    FAKE_ENDPOINTS.restaurants,
    restaurants,
    'restaurants'
  );
  console.log('');

  await sendBulkDataToEndpoint(
    FAKE_ENDPOINTS.customerCares,
    customerCares,
    'customer cares'
  );
  console.log('');

  console.log('🎉 Fake data generation completed!');
  console.log('\nYour admin dashboard should now have data to display.');
  console.log('\nEndpoints created:');
  console.log('- GET/POST/PATCH/DELETE /customers-fake');
  console.log('- GET/POST/PATCH/DELETE /restaurants-fake');
  console.log('- GET/POST/PATCH/DELETE /customer-cares-fake');
}

// Run the script
if (require.main === module) {
  populateDatabase().catch(console.error);
}

module.exports = {
  generateFakeCustomers,
  generateFakeRestaurants,
  generateFakeCustomerCares,
  populateDatabase
};
