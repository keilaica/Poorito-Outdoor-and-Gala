const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client (prefer service role key on the server)
const supabaseUrl = process.env.SUPABASE_URL || 'https://ednzkmajmerlvuwptnti.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY 
  || process.env.SUPABASE_ANON_KEY 
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkbnprbWFqbWVybHZ1d3B0bnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NDcwNTUsImV4cCI6MjA3NTEyMzA1NX0.LPnXAC8K-dZcERJgmq2Fq42x4EtL_n8920FB0fbbES4';

// Log which key is being used (for debugging)
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('✅ Using SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)');
} else if (process.env.SUPABASE_ANON_KEY) {
  console.log('⚠️  Using SUPABASE_ANON_KEY (respects RLS policies)');
  console.log('💡 Tip: Set SUPABASE_SERVICE_ROLE_KEY in .env to bypass RLS');
} else {
  console.log('⚠️  Using fallback anon key (respects RLS policies)');
  console.log('💡 Tip: Set SUPABASE_SERVICE_ROLE_KEY in .env to bypass RLS');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Query timeout wrapper - prevents statement timeout errors
const QUERY_TIMEOUT_MS = 25000; // 25 seconds (slightly less than typical 30s DB timeout)

/**
 * Wraps a Supabase query with a timeout to prevent hanging queries
 * @param {Promise} queryPromise - The Supabase query promise
 * @param {number} timeoutMs - Timeout in milliseconds (default: QUERY_TIMEOUT_MS)
 * @returns {Promise} Promise that rejects with timeout error if query takes too long
 */
const withTimeout = (queryPromise, timeoutMs = QUERY_TIMEOUT_MS) => {
  return Promise.race([
    queryPromise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Query timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
};

/**
 * Retries a query with exponential backoff for transient failures
 * @param {Function} queryFn - Function that returns a Supabase query promise
 * @param {number} maxRetries - Maximum number of retries (default: 2)
 * @param {number} initialDelayMs - Initial delay before retry in ms (default: 1000)
 * @returns {Promise} Query result
 */
const withRetry = async (queryFn, maxRetries = 2, initialDelayMs = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await withTimeout(queryFn());
      
      // Check if result has an error that might be retryable
      if (result.error) {
        const errorCode = result.error.code;
        const errorMessage = result.error.message || '';
        
        // Retry on timeout or connection errors
        const isRetryable = errorCode === '57014' || 
                           errorMessage.includes('timeout') ||
                           errorMessage.includes('connection') ||
                           errorMessage.includes('network');
        
        if (isRetryable && attempt < maxRetries) {
          const delay = initialDelayMs * Math.pow(2, attempt);
          console.warn(`Query failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`, result.error);
          await new Promise(resolve => setTimeout(resolve, delay));
          lastError = result.error;
          continue;
        }
        
        // If not retryable or out of retries, return the error result
        return result;
      }
      
      // Success - return the result
      return result;
    } catch (error) {
      lastError = error;
      
      // Retry on timeout errors
      if (error.message && error.message.includes('timeout') && attempt < maxRetries) {
        const delay = initialDelayMs * Math.pow(2, attempt);
        console.warn(`Query timeout (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If not retryable or out of retries, return error object
      if (attempt >= maxRetries) {
        return { error: error, data: null };
      }
    }
  }
  
  // If we exhausted retries, return the last error
  return { error: lastError, data: null };
};

// Test connection
const testConnection = async () => {
  try {
    // Only test if we have real credentials
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co') {
      console.log('⚠️  Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
      console.log('📖 See SUPABASE_SETUP.md for setup instructions');
      return;
    }

    // Use a publicly readable table for connectivity test
    const { data, error } = await supabase
      .from('mountains')
      .select('id', { count: 'exact', head: true });
    
    if (error) {
      // Supabase errors can have message, code, details, hint, etc.
      const errorDetails = {
        message: error.message || '(no message)',
        code: error.code || '(no code)',
        details: error.details || '(no details)',
        hint: error.hint || '(no hint)'
      };
      // Only show properties that have actual values
      const relevantDetails = Object.entries(errorDetails)
        .filter(([_, value]) => value !== '(no message)' && value !== '(no code)' && value !== '(no details)' && value !== '(no hint)')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      if (Object.keys(relevantDetails).length > 0) {
        console.error('Error connecting to Supabase:', JSON.stringify(relevantDetails, null, 2));
      } else {
        console.error('Error connecting to Supabase:', JSON.stringify(error, null, 2));
      }
      return;
    }
    console.log('✅ Connected to Supabase database');
  } catch (err) {
    // Log full error details for unexpected errors
    const errorDetails = {
      message: err.message || '(no message)',
      code: err.code || '(no code)',
      stack: err.stack || '(no stack)'
    };
    console.error('Supabase connection error:', JSON.stringify(errorDetails, null, 2));
  }
};

// Test connection on startup
testConnection();

module.exports = supabase;
module.exports.withTimeout = withTimeout;
module.exports.withRetry = withRetry;
module.exports.QUERY_TIMEOUT_MS = QUERY_TIMEOUT_MS;
