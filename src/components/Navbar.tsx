
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false); // Close mobile menu after clicking
  };

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">
                SkinnyAI
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => handleSectionClick('features')}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => handleSectionClick('pricing')}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => handleSectionClick('testimonials')}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => handleSectionClick('contact')}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </button>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-muted-foreground">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
              <button 
                onClick={() => handleSectionClick('features')}
                className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-primary"
              >
                Features
              </button>
              <button 
                onClick={() => handleSectionClick('pricing')}
                className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-primary"
              >
                Pricing
              </button>
              <button 
                onClick={() => handleSectionClick('testimonials')}
                className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-primary"
              >
                About
              </button>
              <button 
                onClick={() => handleSectionClick('contact')}
                className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-primary"
              >
                Contact
              </button>
              <div className="px-3 py-2 space-y-2">
                <Link to="/login">
                  <Button variant="ghost" className="w-full text-muted-foreground">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="w-full bg-primary text-primary-foreground">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
