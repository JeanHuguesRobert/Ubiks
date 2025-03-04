import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Personas from './pages/Personas';
import CreatePersona from './pages/CreatePersona';
import EditPersona from './pages/EditPersona';
import PersonaSettings from './pages/PersonaSettings';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { PersonaProvider } from './contexts/PersonaContext';
import { SocialAccountProvider } from './contexts/SocialAccountContext';
import TestAuthPanel from './components/TestAuthPanel';
import PersonaTestPanel from './components/PersonaTestPanel';
import Accounts from './pages/Accounts';
import OAuthCallback from './pages/OAuthCallback';

function App() {
  return (
    <AuthProvider>
      <PersonaProvider>
        <SocialAccountProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/personas" element={
                    <ProtectedRoute>
                      <Personas />
                    </ProtectedRoute>
                  } />
                  <Route path="/personas/create" element={
                    <ProtectedRoute>
                      <CreatePersona />
                    </ProtectedRoute>
                  } />
                  <Route path="/personas/edit/:id" element={
                    <ProtectedRoute>
                      <EditPersona />
                    </ProtectedRoute>
                  } />
                  <Route path="/personas/settings/:id" element={
                    <ProtectedRoute>
                      <PersonaSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/accounts" element={
                    <ProtectedRoute>
                      <Accounts />
                    </ProtectedRoute>
                  } />
                  <Route path="/oauth/callback/:platform" element={<OAuthCallback />} />
                </Routes>
              </main>
              <Footer />
              {process.env.NODE_ENV !== 'production' && <TestAuthPanel />}
              {process.env.NODE_ENV !== 'production' && <PersonaTestPanel />}
            </div>
          </Router>
        </SocialAccountProvider>
      </PersonaProvider>
    </AuthProvider>
  );
}

export default App;
