import { Link } from 'react-router-dom';
import { Github, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              Ubikial
            </Link>
            <p className="mt-4 text-gray-600">
              Your AI assistant for seamless multi-persona social cross-posting.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Product</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-base text-gray-600 hover:text-indigo-600">Features</Link></li>
              <li><Link to="/" className="text-base text-gray-600 hover:text-indigo-600">Pricing</Link></li>
              <li><Link to="/" className="text-base text-gray-600 hover:text-indigo-600">API</Link></li>
              <li><Link to="/" className="text-base text-gray-600 hover:text-indigo-600">Integrations</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-base text-gray-600 hover:text-indigo-600">Documentation</Link></li>
              <li><Link to="/" className="text-base text-gray-600 hover:text-indigo-600">Guides</Link></li>
              <li><Link to="/" className="text-base text-gray-600 hover:text-indigo-600">Blog</Link></li>
              <li><Link to="/" className="text-base text-gray-600 hover:text-indigo-600">Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-base text-gray-600 hover:text-indigo-600">About</Link></li>
              <li><Link to="/" className="text-base text-gray-600 hover:text-indigo-600">Careers</Link></li>
              <li><Link to="/" className="text-base text-gray-600 hover:text-indigo-600">Privacy</Link></li>
              <li><Link to="/" className="text-base text-gray-600 hover:text-indigo-600">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-base text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Ubikial. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
