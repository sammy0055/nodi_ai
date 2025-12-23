import React, { useEffect, useRef, useState } from 'react';
import {
  FiMessageSquare,
  FiShoppingBag,
  FiUsers,
  FiZap,
  FiCheckCircle,
  FiArrowRight,
  FiPlay,
  FiGlobe,
  FiSmartphone,
  FiCode,
  FiTrendingUp,
  FiStar,
  FiMenu,
  FiX,
  FiClock,
  FiDollarSign,
  FiHeadphones,
  FiActivity,
  FiSettings,
  FiChevronRight,
  FiChevronLeft,
} from 'react-icons/fi';
import Button from '../../atoms/Button/Button';
import { Link, useNavigate } from 'react-router';

const LandingPage: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const route = useNavigate();

  const features = [
    {
      icon: <FiMessageSquare className="w-5 h-5" />,
      title: 'AI-Powered Conversations',
      description: 'Intelligent AI agents handle customer inquiries 24/7.',
      color: 'from-blue-500 to-indigo-500',
      delay: '100ms',
    },
    {
      icon: <FiShoppingBag className="w-5 h-5" />,
      title: 'E-commerce Integration',
      description: 'Connect with your store for real-time order updates.',
      color: 'from-emerald-500 to-teal-500',
      delay: '200ms',
    },
    {
      icon: <FiUsers className="w-5 h-5" />,
      title: 'Multi-Agent Teams',
      description: 'Deploy specialized agents for sales and support.',
      color: 'from-violet-500 to-purple-500',
      delay: '300ms',
    },
    {
      icon: <FiZap className="w-5 h-5" />,
      title: 'Automated Workflows',
      description: 'Create custom automation for order updates.',
      color: 'from-amber-500 to-orange-500',
      delay: '400ms',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CEO, Boutique Fashion',
      content: 'CredoByte transformed our customer service. We handle 3x more conversations with 80% less effort.',
      rating: 5,
      avatar: 'SC',
      company: 'StyleHub',
    },
    {
      name: 'Michael Rodriguez',
      role: 'Operations Manager',
      content: 'The AI agents understand customer intent perfectly. Sales conversion increased by 45% in 2 months.',
      rating: 5,
      avatar: 'MR',
      company: 'TechGadgets',
    },
    {
      name: 'Jessica Williams',
      role: 'Founder',
      content: 'From order tracking to recommendations, CredoByte handles everything. A game changer.',
      rating: 5,
      avatar: 'JW',
      company: 'HomeDecorCo',
    },
  ];

  const stats = [
    { value: '24/7', label: 'Availability', icon: <FiClock className="w-4 h-4" /> },
    { value: '90%', label: 'Faster Response', icon: <FiZap className="w-4 h-4" /> },
    { value: '45%', label: 'Higher Conversions', icon: <FiTrendingUp className="w-4 h-4" /> },
    { value: '70%', label: 'Cost Reduction', icon: <FiDollarSign className="w-4 h-4" /> },
  ];

  const integrations = [
    { name: 'Shopify', icon: <FiShoppingBag className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
    { name: 'WhatsApp', icon: <FiMessageSquare className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
    { name: 'WooCommerce', icon: <FiGlobe className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
    { name: 'Custom API', icon: <FiCode className="w-5 h-5" />, color: 'bg-gray-50 text-gray-600' },
    { name: 'Mobile Apps', icon: <FiSmartphone className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Background Elements - Fixed position to prevent blocking */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-50/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-50/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-50/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <FiMessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 tracking-tight">CredoByte</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => scrollToSection('features')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                How it Works
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                Testimonials
              </button>
              <Button
                onClick={() => route('/app')}
                variant="secondary"
                size="sm"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign In
              </Button>
              <Button
                onClick={() => route('/app/auth/sign-up')}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-gray-600 hover:text-gray-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg mx-4 transition-all duration-300 ease-out ${
              isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <div className="p-4 space-y-1">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                How it Works
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Testimonials
              </button>
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-sm border-gray-300"
                  onClick={() => route('/app')}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => route('/app/auth/sign-up')}
                  size="sm"
                  className="w-full text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium mb-8 border border-blue-100 animate-pulse">
              <FiZap className="w-3 h-3 mr-1.5" />
              AI-Powered Customer Conversations
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                E-commerce
              </span>{' '}
              with AI
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              CredoByte helps businesses manage customer conversations using intelligent AI agents. Automate sales,
              support, and marketing on WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                onClick={() => route('/app/auth/sign-up')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-shadow"
              >
                Start Free Trial
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300 hover:border-gray-400">
                <FiPlay className="mr-2 w-4 h-4" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <div className="text-blue-600">{stat.icon}</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Scale</h2>
            <p className="text-lg text-gray-600">Powerful features designed for modern e-commerce businesses</p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-6 transition-all duration-300 hover:shadow-lg border ${
                  activeFeature === index ? 'border-blue-300 shadow-md' : 'border-gray-100 hover:border-blue-200'
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5`}
                >
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Feature Highlight */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-12">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">WhatsApp Business Integration</h3>
                <p className="text-gray-700 mb-6 text-lg">
                  Connect your WhatsApp Business account and let AI agents handle customer conversations automatically.
                  No coding required.
                </p>
                <ul className="space-y-3">
                  {[
                    'Instant order updates',
                    '24/7 customer support',
                    'Personalized recommendations',
                    'Review collection',
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-base text-gray-700">
                      <FiCheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                      <FiMessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <div className="text-base font-semibold text-gray-900">CredoByte AI</div>
                      <div className="text-sm text-gray-500">Online • AI Agent</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-sm">
                      Hi! I can help you track your order #12345. It&apos;s out for delivery and will arrive today by 3
                      PM.
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4 text-sm ml-auto max-w-xs">
                      That&apos;s great! Can you also tell me about your return policy?
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-sm">
                      Absolutely! We offer 30-day returns. You can initiate a return through our app or website.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple Setup, Powerful Results</h2>
            <p className="text-lg text-gray-600">Get started in minutes and see results immediately</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Connect WhatsApp',
                description: 'Link your WhatsApp Business account in minutes with our guided setup.',
                icon: <FiMessageSquare className="w-6 h-6" />,
              },
              {
                step: '2',
                title: 'Train AI Agents',
                description: 'Upload your product catalog, FAQs, and business information.',
                icon: <FiSettings className="w-6 h-6" />,
              },
              {
                step: '3',
                title: 'Set Automation',
                description: 'Create workflows for order updates, support tickets, and marketing.',
                icon: <FiZap className="w-6 h-6" />,
              },
              {
                step: '4',
                title: 'Go Live & Monitor',
                description: 'Launch your AI agents and monitor performance through our dashboard.',
                icon: <FiActivity className="w-6 h-6" />,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 border border-gray-200 hover:border-blue-200 transition-colors group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 text-lg font-bold mb-6 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                  {item.step}
                </div>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mr-4">
                    <div className="text-blue-600">{item.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                </div>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Works With Your Stack</h2>
            <p className="text-lg text-gray-600">Seamlessly integrate with your existing tools and platforms</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 flex flex-col items-center justify-center border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-lg ${integration.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  {integration.icon}
                </div>
                <div className="font-semibold text-gray-900">{integration.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by Businesses</h2>
            <p className="text-lg text-gray-600">See what our customers say about CredoByte</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg">
                      <div className="flex items-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                          {testimonial.avatar}
                        </div>
                        <div className="ml-6">
                          <div className="text-xl font-bold text-gray-900">{testimonial.name}</div>
                          <div className="text-gray-600">{testimonial.role}</div>
                          <div className="text-sm text-gray-500">{testimonial.company}</div>
                          <div className="flex items-center mt-2">
                            {[...Array(5)].map((_, i) => (
                              <FiStar key={i} className="w-4 h-4 text-amber-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-lg text-gray-700 italic leading-relaxed">
                        &ldquo;{testimonial.content}&rdquo;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center items-center mt-10 space-x-3">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <FiChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeTestimonial === index ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <FiChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600">Start free, upgrade as you grow</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$49',
                period: '/month',
                description: 'Perfect for small businesses',
                features: [
                  '1,000 conversations/mo',
                  'Basic AI Agent',
                  'WhatsApp Integration',
                  'Email Support',
                  'Basic Analytics',
                ],
                cta: 'Start Free Trial',
                popular: false,
                color: 'from-blue-500 to-blue-600',
              },
              {
                name: 'Professional',
                price: '$149',
                period: '/month',
                description: 'For growing businesses',
                features: [
                  '10,000 conversations/mo',
                  'Advanced AI Agents (3)',
                  'Multi-channel Support',
                  'Priority Support',
                  'Advanced Analytics',
                  'Custom Workflows',
                ],
                cta: 'Get Started',
                popular: true,
                color: 'from-indigo-500 to-indigo-600',
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                description: 'For large organizations',
                features: [
                  'Unlimited conversations',
                  'Unlimited AI Agents',
                  'Dedicated Support',
                  'Custom Integration',
                  'SLA Guarantee',
                  'Onboarding & Training',
                ],
                cta: 'Contact Sales',
                popular: false,
                color: 'from-gray-700 to-gray-800',
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 relative border ${
                  plan.popular ? 'border-indigo-300 shadow-xl' : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2 text-lg">{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-base">
                      <FiCheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full text-base ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  }`}
                  size="md"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Customer Conversations?</h2>
            <p className="text-xl text-blue-100 mb-10">
              Join thousands of businesses using CredoByte to automate customer interactions and grow sales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg">
                Start 14-Day Free Trial
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <FiHeadphones className="mr-2 w-5 h-5" />
                Schedule a Demo
              </Button>
            </div>
            <p className="mt-6 text-blue-200">No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start mb-12">
            <div className="mb-8 lg:mb-0 lg:w-1/3">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <FiMessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold">CredoByte</span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                AI-powered customer conversation platform for modern e-commerce businesses.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h4 className="font-semibold text-lg mb-4">Product</h4>
                <ul className="space-y-3 text-gray-400">
                  <li>
                    <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">
                      Features
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('how-it-works')}
                      className="hover:text-white transition-colors"
                    >
                      How it Works
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">
                      Pricing
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-4">Company</h4>
                <ul className="space-y-3 text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-4">Legal</h4>
                <ul className="space-y-3 text-gray-400">
                  <li>
                    <Link to="/privacy_policy" className="hover:text-white transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Security
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} CredoByte. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
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

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        html {
          scroll-behavior: smooth;
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #4f46e5, #3b82f6);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4338ca, #2563eb);
        }

        *:focus {
          outline: 2px solid rgba(59, 130, 246, 0.5);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
