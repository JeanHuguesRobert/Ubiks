import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircleAlert, ArrowRight, Check, X } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const { signup, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Clear errors when component unmounts or dependencies change
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Validate password as user types
  const passwordLength = password.length >= 8;
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Reset form errors
    setFormError(null);
    
    // Validate form
    if (!name || !email || !password) {
      setFormError('All fields are required');
      return;
    }
    
    if (!passwordLength) {
      setFormError('Password must be at least 8 characters');
      return;
    }
    
    if (!passwordsMatch) {
      setFormError('Passwords do not match');
      return;
    }
    
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled in the auth context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to existing account
            </Link>
          </p>
        </div>
        
        {(error || formError) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 flex items-center">
            <CircleAlert className="h-5 w-5 mr-2" />
            <p>{error || formError}</p>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formSubmitted && !name ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Full name"
              />
              {formSubmitted && !name && <p className="mt-1 text-sm text-red-600">Name is required</p>}
            </div>
            
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formSubmitted && !email ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Email address"
              />
              {formSubmitted && !email && <p className="mt-1 text-sm text-red-600">Email is required</p>}
            </div>
            
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formSubmitted && (!password || !passwordLength) ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute right-0 bottom-0 px-3 py-2 text-sm text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            
            <div className="relative">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formSubmitted && (!confirmPassword || !passwordsMatch) ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Confirm password"
              />
            </div>

            {/* Password requirements */}
            <div className="space-y-2">
              <div className="flex items-center">
                <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full ${
                  passwordLength ? 'bg-green-100 text-green-500' : 'bg-gray-100 text-gray-400'
                }`}>
                  {passwordLength ? <Check size={12} /> : ''}
                </span>
                <span className="ml-2 text-sm text-gray-600">At least 8 characters</span>
              </div>
              
              <div className="flex items-center">
                <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full ${
                  passwordsMatch ? 'bg-green-100 text-green-500' : (confirmPassword ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400')
                }`}>
                  {passwordsMatch ? <Check size={12} /> : (confirmPassword ? <X size={12} /> : '')}
                </span>
                <span className="ml-2 text-sm text-gray-600">Passwords match</span>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <ArrowRight className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
                </span>
              )}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            By signing up, you agree to our <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>.
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
