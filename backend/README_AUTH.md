Setup env variables:

Create a .env file in backend with:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret

Auth endpoints:
- POST /api/auth/register { name, email, password }
- POST /api/auth/login { email, password }


