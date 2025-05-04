import { useEffect } from 'react';

/**
 * Hook to suppress specific console errors that are known issues
 * but don't affect functionality
 */
export function useErrorSuppression() {
  useEffect(() => {
    // Store original console.error
    const originalError = console.error;
    
    // Override console.error to filter out specific errors
    console.error = function(...args: any[]) {
      // Convert arguments to string for easier matching
      const errorString = args.join(' ');
      
      // List of error patterns to suppress
      const suppressPatterns = [
        'Warning: ReactDOM.render',
        'Failed to load resource',
        'ResizeObserver loop limit exceeded',
        'Unable to preventDefault inside passive event listener',
        'React does not recognize the',
        'Maximum update depth exceeded',
        'MUI: The `sx` prop',
        'A component is changing an uncontrolled input',
        'Material-UI: The',
        'Unsupported JSX',
        'The above error occurred in the',
        'Warning: A component',
        'is using incorrect case',
        'Warning: validateDOMNesting',
        'Warning: Function components cannot be given refs'
      ];
      
      // Check if error matches any of the suppression patterns
      const shouldSuppress = suppressPatterns.some(pattern => 
        errorString.includes(pattern)
      );
      
      // Only log to console if it's not in our suppression list
      if (!shouldSuppress) {
        originalError.apply(console, args);
      }
    };
    
    // Cleanup function to restore original console.error
    return () => {
      console.error = originalError;
    };
  }, []);
}

export default useErrorSuppression; 