import React, { useEffect, useState } from 'react';
import { 
  FiShield, 
  FiLock, 
  FiMessageSquare, 
  FiUser, 
  FiSmartphone, 
  FiMail,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertTriangle,
  FiDownload,
  FiGlobe
} from 'react-icons/fi';
import { Link } from 'react-router';
import Button from '../components/atoms/Button/Button';

const PrivacyPolicy: React.FC = () => {
  const [effectiveDate, setEffectiveDate] = useState<string>('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Set the current date as the effective date
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setEffectiveDate(formattedDate);

    // Handle scroll to show/hide back to top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sections = [
    {
      id: 'nature',
      title: 'Nature of Our WhatsApp Bot Service',
      icon: <FiMessageSquare className="w-5 h-5" />,
      content: (
        <>
          <p className="text-gray-600 mb-4">
            CredoByte provides AI-powered WhatsApp automation tools on behalf of businesses. 
            These bots operate using WhatsApp numbers provided and owned by our clients — not CredoByte directly.
          </p>
        </>
      )
    },
    {
      id: 'information',
      title: 'Information We Collect',
      icon: <FiUser className="w-5 h-5" />,
      content: (
        <>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>Phone Number:</strong> required to process and respond to user messages.</span>
            </li>
            <li className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>Name:</strong> as displayed by WhatsApp to personalize interactions.</span>
            </li>
          </ul>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
            <div className="flex items-center">
              <FiAlertTriangle className="w-5 h-5 text-blue-600 mr-2" />
              <p className="text-blue-700 font-medium">Important Note</p>
            </div>
            <p className="text-blue-600 text-sm mt-1">
              We <strong>do not collect or store</strong> WhatsApp profile pictures or any media 
              unless explicitly requested by the client business and permitted by the user.
            </p>
          </div>
        </>
      )
    },
    {
      id: 'purpose',
      title: 'Purpose of Data Usage',
      icon: <FiGlobe className="w-5 h-5" />,
      content: (
        <>
          <p className="text-gray-600 mb-3">
            Depending on the business use case, the WhatsApp bot may:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {[
              'Process customer orders',
              'Book appointments or reservations',
              'Handle support queries or FAQs',
              'Provide automated business information'
            ].map((item, index) => (
              <div key={index} className="flex items-center bg-gray-50 rounded-lg p-3">
                <FiCheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </>
      )
    },
    {
      id: 'ai-responses',
      title: 'AI-Generated Responses',
      icon: <FiSmartphone className="w-5 h-5" />,
      content: (
        <>
          <p className="text-gray-600 mb-4">
            Our WhatsApp bots use AI (Artificial Intelligence) to generate responses in real time 
            based on user input. While we strive for accuracy and helpfulness:
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-4">
            <div className="flex items-center">
              <FiAlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 font-medium">Disclaimer</p>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              <strong>CredoByte is not responsible for the content, tone, or decisions made 
              based on those AI-generated responses.</strong>
            </p>
          </div>
        </>
      )
    },
    {
      id: 'sharing',
      title: 'Data Sharing & Responsibility',
      icon: <FiShield className="w-5 h-5" />,
      content: (
        <>
          <ul className="space-y-3 mb-4">
            <li className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>We operate strictly as a technology provider on behalf of clients.</span>
            </li>
            <li className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>We do <strong>not</strong> sell or share user data to third parties.</span>
            </li>
            <li className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>All data remains the property of the client business that owns the WhatsApp number.</span>
            </li>
          </ul>
        </>
      )
    },
    {
      id: 'consent',
      title: 'Consent & Opt-Out',
      icon: <FiLock className="w-5 h-5" />,
      content: (
        <>
          <p className="text-gray-600 mb-4">
            By messaging a WhatsApp bot managed by CredoByte, you consent to the use of your 
            phone number and name to facilitate communication through automated responses.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-700">
              <strong>Opting Out:</strong> If you wish to opt out or request data removal, 
              you may contact us directly using the details below.
            </p>
          </div>
        </>
      )
    },
    {
      id: 'contact',
      title: 'Contact Information',
      icon: <FiMail className="w-5 h-5" />,
      content: (
        <>
          <p className="text-gray-600 mb-4">
            If you have concerns about how your data is handled through our WhatsApp 
            automation services, please contact us:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition-colors">
              <div className="flex items-center mb-2">
                <FiMail className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-semibold text-gray-900">Email</h4>
              </div>
              <a 
                href="mailto:support@credobyte.com" 
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                support@credobyte.com
              </a>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition-colors">
              <div className="flex items-center mb-2">
                <FiSmartphone className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-semibold text-gray-900">Phone</h4>
              </div>
              <a 
                href="tel:+9614710505" 
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                +961 4 71 05 05
              </a>
            </div>
          </div>
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <FiShield className="w-4 h-4 text-white" />
              </div>
              <Link to="/" className="text-lg font-semibold text-gray-900 hover:text-gray-700">
                CredoByte
              </Link>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center"
            >
              <FiArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 mb-4">
            <FiShield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-600">
            Effective Date: <span className="font-medium text-gray-900">{effectiveDate}</span>
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mr-3">
              <FiShield className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Our Commitment to Privacy
            </h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            At <strong className="text-gray-900">CredoByte</strong>, we are committed to protecting your privacy. 
            This policy explains how we handle your data when interacting with WhatsApp bots 
            powered by our platform and AI technology.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="bg-white border border-gray-200 rounded-xl p-3 hover:border-blue-300 hover:shadow-sm transition-all text-center group"
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-2 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                    <div className="text-blue-600">{section.icon}</div>
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    {section.title.split(' ').slice(0, 3).join(' ')}...
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 scroll-mt-24"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mr-4">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    {section.title}
                    <span className="ml-3 text-xs font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Section {index + 1}
                    </span>
                  </h2>
                </div>
              </div>
              {section.content}
            </section>
          ))}
        </div>

        {/* Policy Updates */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 md:p-8 mt-8">
          <div className="flex items-center mb-4">
            <FiAlertTriangle className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-blue-900">Policy Updates</h3>
          </div>
          <p className="text-blue-800 mb-4">
            This policy may be updated from time to time to reflect changes in our practices 
            or legal obligations. Continued use of the service indicates acceptance of the 
            latest version.
          </p>
          <div className="flex items-center text-sm text-blue-700">
            <FiCheckCircle className="w-4 h-4 mr-2" />
            <span>Last updated: {effectiveDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center text-gray-600">
            <FiShield className="w-5 h-5 mr-2" />
            <span className="text-sm">Your privacy is our priority</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex items-center"
            >
              <FiDownload className="mr-2 w-4 h-4" />
              Print Policy
            </Button>
            <Button
              variant="primary"
              onClick={scrollToTop}
              className={showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            >
              Back to Top
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} CredoByte. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              This privacy policy is legally binding and governs the use of CredoByte's 
              AI-powered WhatsApp automation services.
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Action Buttons */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all z-40"
          aria-label="Scroll to top"
        >
          <FiArrowLeft className="w-5 h-5 transform rotate-90" />
        </button>
      )}

      {/* Custom Styles */}
      <style>{`
        /* Smooth scrolling for anchor links */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #4f46e5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #4338ca);
        }

        /* Print styles */
        @media print {
          nav, .fixed, button {
            display: none !important;
          }
          
          body {
            background: white !important;
            color: black !important;
          }
          
          .bg-gradient-to-b, .bg-gradient-to-r {
            background: none !important;
          }
          
          .shadow-sm, .shadow-lg {
            box-shadow: none !important;
          }
          
          .border {
            border: 1px solid #ddd !important;
          }
        }

        /* Section animation */
        section {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        section:nth-child(1) { animation-delay: 0.1s; }
        section:nth-child(2) { animation-delay: 0.2s; }
        section:nth-child(3) { animation-delay: 0.3s; }
        section:nth-child(4) { animation-delay: 0.4s; }
        section:nth-child(5) { animation-delay: 0.5s; }
        section:nth-child(6) { animation-delay: 0.6s; }
        section:nth-child(7) { animation-delay: 0.7s; }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export {PrivacyPolicy};