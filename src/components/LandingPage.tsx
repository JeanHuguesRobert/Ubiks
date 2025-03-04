import { ArrowRight, Github, Layers, Lock, RefreshCw, Zap } from 'lucide-react';
import { useEffect } from 'react';

const LandingPage = () => {
  // Load Outfit font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="font-['Outfit',sans-serif]">
      {/* Hero Section */}
      <section className="pt-28 pb-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Your AI Assistant for Social Cross-Posting
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Ubikial helps you manage multiple personas across social networks, 
              adapting to each unique voice while saving you hours of work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg text-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center">
                Get Started Free <ArrowRight className="ml-2" size={18} />
              </button>
              <button className="px-8 py-3 border border-indigo-600 text-indigo-600 rounded-lg text-lg font-medium hover:bg-indigo-50 transition flex items-center justify-center">
                See Demo
              </button>
            </div>
          </div>
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Ubikial Dashboard Preview" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your social presence across multiple platforms with distinct personas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-xl border border-indigo-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <RefreshCw className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Persona Management</h3>
              <p className="text-gray-600">
                Create and manage unique personas for different social platforms, with AI that learns and adapts to each voice.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="text-purple-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">One-Shot Cross-Posting</h3>
              <p className="text-gray-600">
                Compose once, and let Ubikial adapt your content for each platform and persona automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Github className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">GitHub-Based Storage</h3>
              <p className="text-gray-600">
                All your data is securely stored in your own GitHub repositories with version control built-in.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl border border-green-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Layers className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Style Learning</h3>
              <p className="text-gray-600">
                Ubikial analyzes your past posts to understand each persona's unique style and tone.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-xl border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-6">
                <Lock className="text-amber-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bring Your Own AI</h3>
              <p className="text-gray-600">
                Connect your preferred AI API for complete control over language model selection and costs.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-rose-50 to-white p-8 rounded-xl border border-rose-100">
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-6">
                <RefreshCw className="text-rose-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Scheduled Publishing</h3>
              <p className="text-gray-600">
                Plan your content calendar in advance with scheduled posts for each platform and persona.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Ubikial Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to revolutionize your social media workflow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Connect & Create</h3>
              <p className="text-gray-600">
                Link your social accounts and create distinct personas for each platform or audience.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Compose Once</h3>
              <p className="text-gray-600">
                Write your original post with Ubikial's AI-powered editor that understands your goals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cross-Post Everywhere</h3>
              <p className="text-gray-600">
                Watch as Ubikial adapts your content for each platform and persona, maintaining consistency with unique voices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade when you need more power
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="border border-gray-200 rounded-xl p-8 bg-white hover:shadow-lg transition duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free Tier</h3>
              <p className="text-gray-500 mb-6">Perfect for getting started</p>
              <p className="text-4xl font-bold text-gray-900 mb-6">$0<span className="text-lg text-gray-500 font-normal">/month</span></p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>2 social accounts</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>1 persona per account</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>BYO AI API required</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>GitHub storage integration</span>
                </li>
              </ul>
              
              <button className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition">
                Get Started
              </button>
            </div>
            
            {/* Pro Tier */}
            <div className="border-2 border-indigo-600 rounded-xl p-8 bg-white shadow-xl relative">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
              <p className="text-gray-500 mb-6">For power users</p>
              <p className="text-4xl font-bold text-gray-900 mb-6">$19<span className="text-lg text-gray-500 font-normal">/month</span></p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>10 social accounts</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>5 personas per account</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>BYO AI API or use included credits</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Scheduled posting</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Analytics and insights</span>
                </li>
              </ul>
              
              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition">
                Try Pro
              </button>
            </div>
            
            {/* Enterprise Tier */}
            <div className="border border-gray-200 rounded-xl p-8 bg-white hover:shadow-lg transition duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-500 mb-6">For teams and businesses</p>
              <p className="text-4xl font-bold text-gray-900 mb-6">$49<span className="text-lg text-gray-500 font-normal">/month</span></p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Unlimited social accounts</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Unlimited personas</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Team collaboration features</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Priority support</span>
                </li>
              </ul>
              
              <button className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to transform your social media strategy?</h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-3xl mx-auto">
            Join thousands of creators and businesses who are saving time and improving engagement with Ubikial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-indigo-600 rounded-lg text-lg font-medium hover:bg-indigo-50 transition">
              Get Started Free
            </button>
            <button className="px-8 py-3 border border-white text-white rounded-lg text-lg font-medium hover:bg-indigo-500 transition">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
