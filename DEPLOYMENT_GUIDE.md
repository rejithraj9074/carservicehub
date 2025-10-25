# Deployment Guide for CarvoHub

This guide will help you deploy your CarvoHub application to Render for both frontend and backend services.

## Prerequisites

1. A Render account (https://render.com)
2. Your GitHub repository with the CarvoHub code
3. MongoDB Atlas account for database
4. Firebase project for authentication
5. Razorpay account for payments

## Backend Deployment (Node.js Server)

### 1. Create a New Web Service on Render

1. Go to your Render dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Set the following configurations:
   - **Name**: carvohub-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or choose as needed)

### 2. Configure Environment Variables

In the Render dashboard, go to your web service settings and add these environment variables:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
MONGO_URI=your-mongodb-atlas-connection-string
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY_ID=your-firebase-private-key-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key-with-literal-\n
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
FRONTEND_URL=https://your-frontend-url.onrender.com
```

**Important Notes:**
- For `FIREBASE_PRIVATE_KEY`, replace actual newlines with `\n` characters
- Make sure to use your actual values for all variables
- `FRONTEND_URL` should match your actual frontend URL on Render

### 3. Deploy

Click "Create Web Service" and wait for deployment to complete.

## Frontend Deployment (React App)

### 1. Create a New Static Site on Render

1. Go to your Render dashboard
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Set the following configurations:
   - **Name**: carvohub-frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Instance Type**: Free (or choose as needed)

### 2. Configure Environment Variables

In the Render dashboard, go to your static site settings and add these environment variables:

```
REACT_APP_API_BASE_URL=https://carvohub-backend.onrender.com
REACT_APP_RAZORPAY_KEY_ID=your-razorpay-key-id
```

**Important Notes:**
- The backend URL should match your actual Render backend service name
- In your case, it should be `https://carvohub-backend.onrender.com`

### 3. Add Redirect Configuration

Create a file `_redirects` in your frontend `public` directory with this content:

```
/*    /index.html   200
```

This ensures React Router works correctly with client-side routing.

### 4. Deploy

Click "Create Static Site" and wait for deployment to complete.

## Local Development Setup

### Backend

1. Create a `.env` file in the `backend` directory with your local configuration:
   ```
   PORT=5000
   JWT_SECRET=supersecret123
   MONGO_URI=your-local-or-atlas-mongodb-uri
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=your-firebase-client-email
   FIREBASE_PRIVATE_KEY_ID=your-firebase-private-key-id
   FIREBASE_PRIVATE_KEY=your-firebase-private-key
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   ```

2. Run the backend:
   ```bash
   cd backend
   npm install
   npm start
   ```

### Frontend

1. Create a `.env` file in the `frontend` directory with your local configuration:
   ```
   PORT=3000
   REACT_APP_API_BASE_URL=http://localhost:5000
   REACT_APP_RAZORPAY_KEY_ID=your-razorpay-key-id
   ```

2. Run the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Troubleshooting

### Common Issues

1. **CORS Errors**: 
   - Make sure `FRONTEND_URL` is correctly set in your backend environment variables on Render
   - Check that your frontend URL exactly matches what's configured in the backend
   - The backend now allows multiple origins including localhost for development

2. **Firebase Authentication Issues**: 
   - Ensure all Firebase environment variables are correctly set
   - Check that your Firebase private key uses literal `\n` characters instead of actual newlines

3. **API Connection Issues**:
   - Verify that `REACT_APP_API_BASE_URL` points to your Render backend URL
   - Check that your backend is running and accessible
   - Make sure you've updated the environment variables with your actual Render URLs

4. **Data Not Loading on Other Devices**:
   - This typically happens when the frontend is trying to connect to localhost:5000 from another device
   - Make sure `REACT_APP_API_BASE_URL` in your production environment points to your Render backend URL, not localhost
   - Ensure CORS is properly configured to allow requests from your frontend domain

### Checking Logs

You can check your application logs in the Render dashboard:
1. Go to your service
2. Click on "Logs" tab
3. Check for any error messages

## Environment-Specific Configuration

The application automatically loads different environment files based on the `NODE_ENV` variable:
- Development: Uses `.env` file
- Production: Uses `.env.production` file

Make sure to update both files with appropriate values for each environment.

## Network Access for Mobile Devices

If you're testing on mobile devices on the same network as your development machine:

1. Find your development machine's local IP address:
   - Windows: Run `ipconfig` in Command Prompt
   - Mac/Linux: Run `ifconfig` in Terminal

2. Update your frontend `.env` file to use your machine's IP:
   ```
   REACT_APP_API_BASE_URL=http://YOUR_LOCAL_IP:5000
   ```

3. Make sure your firewall allows connections on ports 3000 and 5000

4. Access your app from mobile at: `http://YOUR_LOCAL_IP:3000`

## Important Notes for Production

1. Always use HTTPS in production
2. Never commit sensitive credentials to version control
3. Regularly rotate your JWT secret and other security keys
4. Monitor your application logs for security issues
5. Keep your dependencies updated

## Security Considerations for Production

For production deployment, you should restrict CORS to only your frontend domain:

1. In your backend `server.js`, change the CORS configuration:
   ```javascript
   if (environment === 'production') {
     app.use(cors({
       origin: process.env.FRONTEND_URL || "https://your-frontend-url.onrender.com",
       credentials: true,
       optionsSuccessStatus: 200
     }));
   }
   ```

2. Make sure to set the `FRONTEND_URL` environment variable on Render to your actual frontend URL.