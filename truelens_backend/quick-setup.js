#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("🔑 TrueLens Veritas - Quick OpenAI API Key Setup");
console.log("=" + "=".repeat(50));

function askForApiKey() {
  rl.question('\n📝 Please enter your OpenAI API key (starts with sk-): ', (apiKey) => {
    if (!apiKey || apiKey.trim() === '') {
      console.log("❌ No API key provided. Please try again.");
      askForApiKey();
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      console.log("⚠️  API key should start with 'sk-'. Are you sure this is correct? (y/n): ");
      rl.question('', (response) => {
        if (response.toLowerCase() === 'y' || response.toLowerCase() === 'yes') {
          updateEnvFile(apiKey.trim());
        } else {
          askForApiKey();
        }
      });
      return;
    }

    updateEnvFile(apiKey.trim());
  });
}

function updateEnvFile(apiKey) {
  try {
    const envPath = '.env';
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace the OpenAI API key line
    envContent = envContent.replace(
      /OPENAI_API_KEY=.*/,
      `OPENAI_API_KEY=${apiKey}`
    );
    
    fs.writeFileSync(envPath, envContent);
    
    console.log("\n✅ OpenAI API key updated successfully!");
    console.log("🚀 Now you can run:");
    console.log("   npm run init-services");
    console.log("   npm start");
    
    rl.close();
  } catch (error) {
    console.error("❌ Failed to update .env file:", error.message);
    rl.close();
  }
}

console.log("\n📋 Instructions:");
console.log("1. Go to: https://platform.openai.com/api-keys");
console.log("2. Create a new API key");
console.log("3. Copy the key (starts with sk-)");
console.log("4. Paste it below");

askForApiKey(); 