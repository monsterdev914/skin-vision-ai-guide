
import { useState } from "react";
import { Send } from "lucide-react";

interface RippleButtonProps {
  onClick?: (e: React.FormEvent) => void;
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
  className?: string;
}

const RippleButton = ({ onClick, type = "button", children, className = "" }: RippleButtonProps) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 800);

    if (onClick) {
      onClick(event as any);
    }
  };

  return (
    <button
      type={type}
      onClick={createRipple}
      className={`relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-6 py-2 overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      <Send className="mr-2 h-4 w-4" />
      {children || "Send Message"}
      {ripples.map((ripple) => (
        <div key={ripple.id}>
          {/* Main ripple effect */}
          <span
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x - 15,
              top: ripple.y - 15,
              width: '30px',
              height: '30px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              animation: 'ripple-effect 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
          {/* Secondary pulse effect */}
          <span
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: '20px',
              height: '20px',
              background: 'rgba(255,255,255,0.4)',
              animation: 'ripple-pulse 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s',
            }}
          />
        </div>
      ))}
    </button>
  );
};

export default RippleButton;
