
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactInfo = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
            <p className="text-gray-600">support@skinnyai.com</p>
            <p className="text-gray-600">hello@skinnyai.com</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
            <p className="text-gray-600">+1 (555) 123-4567</p>
            <p className="text-sm text-gray-500">Mon-Fri 9am-6pm EST</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Office</h3>
            <p className="text-gray-600">123 Innovation Drive</p>
            <p className="text-gray-600">San Francisco, CA 94107</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactInfo;
