// Test script to verify API configuration and authentication
import { getApiUrl, apiCall } from './src/config/api.js';

console.log('🧪 Testing Frontend API Configuration...\n');

// Test API URL detection
console.log('1️⃣ Testing API URL Detection:');
console.log('Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'Node.js environment');
console.log('API Base URL:', getApiUrl(''));

// Test admin login
console.log('\n2️⃣ Testing Admin Login:');
try {
  const loginData = await fetch(getApiUrl('/api/admin/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'aalacomputerstore@gmail.com',
      password: 'karachi123'
    })
  });
  
  const result = await loginData.json();
  console.log('Login result:', result);
  
  if (result.ok) {
    console.log('✅ Login successful');
    
    // Store token for testing
    localStorage.setItem('aalacomp_admin_token', result.token);
    
    // Test protected endpoint
    console.log('\n3️⃣ Testing Protected Endpoint:');
    try {
      const productsData = await apiCall('/api/admin/products');
      console.log('Products data:', productsData);
      console.log('✅ Protected endpoint access successful');
    } catch (error) {
      console.log('❌ Protected endpoint failed:', error.message);
    }
    
    // Test stats endpoint
    console.log('\n4️⃣ Testing Stats Endpoint:');
    try {
      const statsData = await apiCall('/api/admin/stats');
      console.log('Stats data:', statsData);
      console.log('✅ Stats endpoint access successful');
    } catch (error) {
      console.log('❌ Stats endpoint failed:', error.message);
    }
    
  } else {
    console.log('❌ Login failed:', result.error);
  }
  
} catch (error) {
  console.log('❌ Network error:', error.message);
}

console.log('\n🎉 Frontend API configuration test completed!');
