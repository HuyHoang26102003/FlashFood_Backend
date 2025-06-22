# Fake Data Generation System

This system provides fake controllers and data generation scripts to populate your FlashFood database with test data for the admin dashboard.

## 🎯 Purpose

The admin dashboard needs real data to display charts, tables, and statistics. This system allows you to quickly populate the database with realistic fake data without needing to create cascading relationships.

## 📁 Files Created

### Fake Controllers

- `src/customers/customers.controller.fake.ts` - Bypasses auth for customer operations
- `src/restaurants/restaurants.controller.fake.ts` - Bypasses auth for restaurant operations
- `src/customer_cares/customer_cares.controller.fake.ts` - Bypasses auth for customer care operations

### Data Generator

- `fake-data-generator.js` - Node.js script that generates and posts fake data

## 🚀 Quick Start

### 1. Install Dependencies (if needed)

```bash
npm install node-fetch
```

### 2. Start Your Backend

Make sure your NestJS backend is running on `http://localhost:3000`

### 3. Run the Data Generator

```bash
node fake-data-generator.js
```

This will create:

- ✅ 15 fake customers
- ✅ 12 fake restaurants
- ✅ 6 fake customer care agents

## 🔧 Available Endpoints

### Customers (No Auth Required)

- `GET /customers-fake` - Get all customers
- `POST /customers-fake` - Create a customer
- `GET /customers-fake/:id` - Get customer by ID
- `PATCH /customers-fake/:id` - Update customer
- `DELETE /customers-fake/:id` - Delete customer
- `POST /customers-fake/bulk` - Create multiple customers

### Restaurants (No Auth Required)

- `GET /restaurants-fake` - Get all restaurants
- `POST /restaurants-fake` - Create a restaurant
- `GET /restaurants-fake/:id` - Get restaurant by ID
- `PATCH /restaurants-fake/:id` - Update restaurant
- `DELETE /restaurants-fake/:id` - Delete restaurant
- `POST /restaurants-fake/bulk` - Create multiple restaurants

### Customer Cares (No Auth Required)

- `GET /customer-cares-fake` - Get all customer care agents
- `POST /customer-cares-fake` - Create a customer care agent
- `GET /customer-cares-fake/:id` - Get customer care by ID
- `PATCH /customer-cares-fake/availability/:id` - Toggle availability
- `DELETE /customer-cares-fake/:id` - Delete customer care agent
- `POST /customer-cares-fake/bulk` - Create multiple customer care agents

## 📊 Data Structure

### Customer Data Sample

```json
{
  "user_id": "user-customer-1",
  "first_name": "Customer1",
  "last_name": "Test1",
  "address": "123 Main St, City 1",
  "avatar": {
    "url": "https://randomuser.me/api/portraits/men/1.jpg",
    "key": "avatar-customer-1"
  },
  "app_preferences": {
    "theme": "LIGHT"
  },
  "created_at": 1703123456789,
  "updated_at": 1703123456789
}
```

### Restaurant Data Sample

```json
{
  "owner_id": "user-restaurant-owner-1",
  "owner_name": "Owner 1",
  "restaurant_name": "Restaurant 1",
  "description": "A wonderful restaurant serving delicious food...",
  "contact_email": [
    {
      "title": "Main Contact",
      "is_default": true,
      "email": "restaurant1@example.com"
    }
  ],
  "status": {
    "is_open": true,
    "is_active": true,
    "is_accepted_orders": true
  },
  "opening_hours": {
    "mon": { "from": 9, "to": 22 },
    "tue": { "from": 9, "to": 22 }
  }
}
```

## 🛠 Customization

### Modify Data Generation

Edit `fake-data-generator.js` to customize:

- Number of records: Change count parameters in `populateDatabase()`
- Data structure: Modify the generator functions
- API endpoints: Update `FAKE_ENDPOINTS` configuration

### Add More Entities

To add fake controllers for other entities:

1. Create `{entity}.controller.fake.ts` following the pattern
2. Add it to the module's controllers array
3. Add generator function to the script

## ⚠️ Important Notes

- **No Authentication**: Fake controllers bypass all auth guards
- **No Cascading**: Data is inserted without cascade requirements
- **Development Only**: These endpoints should NOT be deployed to production
- **Data Isolation**: Fake data uses unique IDs to avoid conflicts

## 🧹 Cleanup

To remove fake data:

```bash
# Delete all fake customers
curl -X DELETE http://localhost:3000/customers-fake/user-customer-1

# Or truncate tables directly in your database
```

## 🔒 Security

**CRITICAL**: Before deploying to production:

1. Remove fake controllers from modules
2. Delete fake controller files
3. Remove this script from production builds

## 🚀 Next Steps

After populating data:

1. ✅ Check your admin dashboard - it should now show data
2. ✅ Test charts and statistics features
3. ✅ Verify all entities are displaying correctly
4. ✅ Continue with your admin dashboard development

---

Happy coding! 🎉
