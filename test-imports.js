// Test file to check imports
console.log("Testing imports...");

try {
    const { supabase } = require('./lib/supabase');
    console.log("✅ Supabase import successful");
} catch (error) {
    console.log("❌ Supabase import failed:", error.message);
}

try {
    const { openai } = require('./lib/openai');
    console.log("✅ OpenAI import successful");
} catch (error) {
    console.log("❌ OpenAI import failed:", error.message);
}

try {
    const { generateTrendingTopics } = require('./lib/openai');
    console.log("✅ generateTrendingTopics import successful");
} catch (error) {
    console.log("❌ generateTrendingTopics import failed:", error.message);
}

console.log("Import test completed");