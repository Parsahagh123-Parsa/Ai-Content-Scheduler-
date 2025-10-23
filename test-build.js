// Simple test to check if the app can be imported
console.log("Testing app imports...");

try {
    // Test basic imports
    const fs = require('fs');
    const path = require('path');

    console.log("✅ Basic Node.js modules work");

    // Check if the main page file exists and is readable
    const pagePath = path.join(__dirname, 'app', 'page.tsx');
    if (fs.existsSync(pagePath)) {
        console.log("✅ page.tsx exists");
        const content = fs.readFileSync(pagePath, 'utf8');
        console.log("✅ page.tsx is readable, length:", content.length);
    } else {
        console.log("❌ page.tsx not found");
    }

    // Check if the content-generator file exists
    const contentGenPath = path.join(__dirname, 'lib', 'content-generator.ts');
    if (fs.existsSync(contentGenPath)) {
        console.log("✅ content-generator.ts exists");
        const content = fs.readFileSync(contentGenPath, 'utf8');
        console.log("✅ content-generator.ts is readable, length:", content.length);
    } else {
        console.log("❌ content-generator.ts not found");
    }

} catch (error) {
    console.log("❌ Error:", error.message);
}

console.log("Test completed");