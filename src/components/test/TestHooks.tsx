import React from 'react';
import { useProfileState } from '@/hooks/useProfileState';
import { useProfileRetry } from '@/hooks/useRetry';

// This is a test component to verify that the hooks can be imported correctly
const TestHooks: React.FC = () => {
  // Test useProfileState hook
  const { state, actions, operations } = useProfileState();
  
  // Test useProfileRetry hook directly
  const { executeWithRetry, isRetrying } = useProfileRetry();
  
  return (
    <div>
      <h1>Test Hooks Component</h1>
      <p>This component is just for testing imports.</p>
      
      <div>
        <h2>Profile State</h2>
        <p>Loading: {state.isLoading ? 'Yes' : 'No'}</p>
        <p>Retrying: {isRetrying ? 'Yes' : 'No'}</p>
        <button onClick={() => actions.setLoading(true)}>Set Loading</button>
      </div>
    </div>
  );
};

export default TestHooks;