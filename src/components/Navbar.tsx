import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false); // Close mobile menu after clicking
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Logo className="w-[100px] h-[100px] text-blue-600" />
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button onClick={() => handleSectionClick('features')} className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Features
              </button>
              <button onClick={() => handleSectionClick('pricing')} className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Pricing
              </button>
              <button onClick={() => handleSectionClick('testimonials')} className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                About
              </button>
              <button onClick={() => handleSectionClick('contact')} className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Contact
              </button>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-600 font-medium">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:opacity-90 font-medium">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <button onClick={() => handleSectionClick('features')} className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 font-medium">
                Features
              </button>
              <button onClick={() => handleSectionClick('pricing')} className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 font-medium">
                Pricing
              </button>
              <button onClick={() => handleSectionClick('testimonials')} className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 font-medium">
                About
              </button>
              <button onClick={() => handleSectionClick('contact')} className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 font-medium">
                Contact
              </button>
              <div className="px-3 py-2 space-y-2">
                <Link to="/login">
                  <Button variant="ghost" className="w-full text-gray-600 font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>}
      </div>
    </nav>
  );
};

export default Navbar;
