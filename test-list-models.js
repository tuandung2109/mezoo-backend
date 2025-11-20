const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  try {
    console.log('📋 Listing available Gemini models...');
    console.log('');
    
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );

    console.log('✅ Available models:');
    console.log('');
    
    response.data.models.forEach(model => {
      if (model.supportedGenerationMethods?.includes('generateContent')) {
        console.log(`📦 ${model.name}`);
        console.log(`   Display Name: ${model.displayName}`);
        console.log(`   Methods: ${model.supportedGenerationMethods.join(', ')}`);
        console.log('');
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

listModels();
