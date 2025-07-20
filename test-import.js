// This is a simple script to test if the module imports work correctly
// Run this with: node test-import.js

// We'll use dynamic imports to test if the modules can be imported correctly
async function testImports() {
  try {
    console.log('Testing imports...');
    
    // Import the modules dynamically
    const useRetryModule = await import('./src/hooks/useRetry.ts');
    console.log('useRetry.ts exports:', Object.keys(useRetryModule));
    
    if (useRetryModule.useProfileRetry) {
      console.log('✅ useProfileRetry is exported from useRetry.ts');
    } else {
      console.log('❌ useProfileRetry is NOT exported from useRetry.ts');
    }
    
    console.log('All tests completed.');
  } catch (error) {
    console.error('Error during import testing:', error);
  }
}

testImports();