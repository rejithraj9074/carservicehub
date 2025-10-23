import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check for service account key file
const serviceAccountPath = join(__dirname, '..', 'serviceAccountKey.json');

console.log('Checking service account key file...');

if (fs.existsSync(serviceAccountPath)) {
  console.log('✅ Service account key file found at:', serviceAccountPath);
  
  try {
    const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
    console.log('✅ File read successfully');
    
    const serviceAccount = JSON.parse(fileContent);
    console.log('✅ JSON parsed successfully');
    
    console.log('Project ID:', serviceAccount.project_id);
    console.log('Client Email:', serviceAccount.client_email);
    console.log('Private Key ID:', serviceAccount.private_key_id);
    console.log('Private Key length:', serviceAccount.private_key.length);
    
    // Check private key format
    if (serviceAccount.private_key.startsWith('-----BEGIN PRIVATE KEY-----') && 
        serviceAccount.private_key.endsWith('-----END PRIVATE KEY-----\n')) {
      console.log('✅ Private key format looks correct');
    } else {
      console.log('❌ Private key format is incorrect');
      console.log('Private key starts with:', serviceAccount.private_key.substring(0, 30));
      console.log('Private key ends with:', serviceAccount.private_key.substring(serviceAccount.private_key.length - 30));
    }
  } catch (error) {
    console.error('❌ Error parsing service account key file:', error.message);
  }
} else {
  console.log('❌ Service account key file not found at:', serviceAccountPath);
}