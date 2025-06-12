
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">SkinnyAI</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Revolutionizing skin care with AI-powered analysis and personalized treatment recommendations. 
              Your journey to healthier skin starts here.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Instagram
              </a>
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link to="#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link to="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">API</Link></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2024 SkinnyAI. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                HIPAA Compliance
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
