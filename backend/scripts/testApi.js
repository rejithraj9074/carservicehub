import fetch from 'node-fetch';

async function testApi() {
  try {
    const response = await fetch('http://localhost:5000/api/cars');
    const data = await response.json();
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testApi();