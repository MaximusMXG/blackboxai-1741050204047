import { useAuth as originalUseAuth } from '../context/AuthContext.jsx';

// Re-export the hook with the same name to maintain compatibility
export const useAuth = originalUseAuth;
export default originalUseAuth;
