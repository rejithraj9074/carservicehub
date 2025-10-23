import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Export a function to initialize Firebase Admin
export const initializeFirebaseAdmin = () => {
  // Only initialize if not already initialized
  if (!admin.apps.length) {
    try {
      // Check for service account key file in multiple locations
      const possiblePaths = [
        join(__dirname, '..', 'serviceAccountKey.json'), // backend/ directory
        join(__dirname, 'serviceAccountKey.json'),       // config/ directory
        join(__dirname, '..', '..', 'serviceAccountKey.json') // root directory
      ];
      
      let serviceAccount = null;
      let serviceAccountPath = null;
      
      for (const path of possiblePaths) {
        if (fs.existsSync(path)) {
          serviceAccountPath = path;
          break;
        }
      }
      
      if (serviceAccountPath) {
        // Initialize with service account key file
        console.log(`Found service account key file at: ${serviceAccountPath}`);
        const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
        serviceAccount = JSON.parse(fileContent);
        
        // Validate service account structure
        if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
          throw new Error('Service account key file is missing required fields');
        }
        
        // Check if private key looks valid
        if (!serviceAccount.private_key.startsWith('-----BEGIN PRIVATE KEY-----') || 
            !serviceAccount.private_key.endsWith('-----END PRIVATE KEY-----\n')) {
          throw new Error('Private key format is invalid');
        }
        
        // Check if private key is long enough (should be > 1000 characters for a real key)
        if (serviceAccount.private_key.length < 1000) {
          console.warn('⚠️ WARNING: Private key appears to be too short. This might be a placeholder key.');
          console.warn('⚠️ A real Firebase private key should be several thousand characters long.');
          console.warn('⚠️ Please download the complete service account key file from Firebase Console.');
        }
        
        console.log(`Service account project ID: ${serviceAccount.project_id}`);
        console.log(`Service account client email: ${serviceAccount.client_email}`);
        console.log(`Private key length: ${serviceAccount.private_key.length}`);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized with service account key file');
        return admin;
      } 
      // Try environment variables
      else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        // Remove quotes if they exist
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/^"(.*)"$/, '$1').replace(/\\n/g, '\n');
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL.replace(/^"(.*)"$/, '$1');
        const projectId = process.env.FIREBASE_PROJECT_ID ? process.env.FIREBASE_PROJECT_ID.replace(/^"(.*)"$/, '$1') : null;
        
        console.log('Attempting to initialize Firebase Admin with environment variables...');
        console.log('Project ID:', projectId);
        console.log('Client Email:', clientEmail);
        console.log('Private Key length:', privateKey.length);
        
        // Validate private key format
        if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----') || 
            !privateKey.endsWith('-----END PRIVATE KEY-----\n')) {
          throw new Error('Environment variable private key format is invalid');
        }
        
        // Check if private key is long enough
        if (privateKey.length < 1000) {
          console.warn('⚠️ WARNING: Private key appears to be too short. This might be a placeholder key.');
          console.warn('⚠️ A real Firebase private key should be several thousand characters long.');
          console.warn('⚠️ Please ensure your FIREBASE_PRIVATE_KEY environment variable contains the complete key.');
        }
        
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: projectId,
            privateKey: privateKey,
            clientEmail: clientEmail
          })
        });
        console.log('✅ Firebase Admin initialized with environment variables');
        return admin;
      } 
      // Fallback to default initialization (requires Firebase CLI)
      else {
        console.log('No service account key file or environment variables found');
        admin.initializeApp();
        console.log('⚠️ Firebase Admin initialized with default credentials (requires Firebase CLI)');
        return admin;
      }
    } catch (error) {
      console.error('⚠️ Firebase Admin initialization failed:', error.message);
      console.error('Stack trace:', error.stack);
      console.warn('Proceeding without Firebase Admin. Google Sign-In may not work.');
      console.warn('To fix this issue:');
      console.warn('1. Download the complete service account key file from Firebase Console');
      console.warn('2. Replace the current serviceAccountKey.json with the downloaded file');
      console.warn('3. Ensure the private key is complete (several thousand characters long)');
      // Create a mock admin object for development
      global.firebaseAdminMock = true;
      return admin;
    }
  }
  
  return admin;
};

export default admin;