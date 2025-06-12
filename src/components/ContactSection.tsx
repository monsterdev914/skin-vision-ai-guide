
import { Badge } from "@/components/ui/badge";
import ContactForm from "./ContactForm";
import ContactInfo from "./ContactInfo";

const ContactSection = () => {
  return (
    <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 border-blue-200">
            📞 Get In Touch
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Contact <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Our Team
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about our AI skin analysis? Need support? 
            We're here to help you on your journey to healthier skin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <ContactInfo />
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
