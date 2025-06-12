
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card text-foreground py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">SkinnyAI</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Revolutionizing skin care with AI-powered analysis and personalized treatment recommendations. 
              Your journey to healthier skin starts here.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Twitter
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Instagram
              </a>
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Product</h3>
            <ul className="space-y-3">
              <li><Link to="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">API</Link></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-3">
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground mb-4 md:mb-0">
              © 2024 SkinnyAI. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-primary transition-colors">
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
