import { Link } from 'react-router-dom';
import { 
  Shield, 
  Bot, 
  Users, 
  FileText, 
  CheckCircle,
  ArrowRight,
  Stethoscope,
  Building2,
  UserCheck,
  Zap,
  Award,
  Globe,
  Star,
  ChevronRight,
  Play
} from 'lucide-react';
import AICapabilitiesSection from './ai/AICapabilitiesSection';

const LandingPage = () => {
  const features = [
    {
      icon: <Bot className="w-10 h-10 text-blue-500" />,
      title: "AI-Powered Processing",
      description: "Advanced machine learning algorithms process claims 10x faster with 99.2% accuracy",
      highlight: "99.2% Accuracy"
    },
    {
      icon: <Zap className="w-10 h-10 text-yellow-500" />,
      title: "Instant Verification",
      description: "Real-time document validation and fraud detection using computer vision technology",
      highlight: "Real-time"
    },
    {
      icon: <Shield className="w-10 h-10 text-green-500" />,
      title: "Enterprise Security",
      description: "Bank-grade encryption with HIPAA compliance and SOC 2 Type II certification",
      highlight: "HIPAA Compliant"
    },
    {
      icon: <Award className="w-10 h-10 text-purple-500" />,
      title: "Smart Automation",
      description: "Intelligent workflow automation reduces processing time from weeks to hours",
      highlight: "75% Faster"
    }
  ];

  const portals = [
    {
      title: "Employee Portal",
      subtitle: "For Claim Submission",
      description: "Submit claims, upload documents, and track your claim status with real-time updates and AI assistance",
      icon: <Users className="w-16 h-16 text-white" />,
      link: "/employee",
      gradient: "from-blue-500 to-blue-700",
      hoverGradient: "hover:from-blue-600 hover:to-blue-800",
      features: ["Submit Claims", "Track Status", "Upload Documents", "AI Assistance"]
    },
    {
      title: "Doctor Portal",
      subtitle: "For Medical Reports",
      description: "Upload medical reports, provide treatment details, and manage patient records efficiently",
      icon: <Stethoscope className="w-16 h-16 text-white" />,
      link: "/doctor",
      gradient: "from-teal-500 to-cyan-600",
      hoverGradient: "hover:from-teal-600 hover:to-cyan-700",
      features: ["Submit Reports", "Patient Records", "Treatment Details", "Quick Upload"]
    },
    {
      title: "Insurance Portal",
      subtitle: "For Claim Review",
      description: "Review claims, verify documents, and manage approval workflows with AI-powered insights",
      icon: <Building2 className="w-16 h-16 text-white" />,
      link: "/insurance",
      gradient: "from-green-500 to-emerald-600",
      hoverGradient: "hover:from-green-600 hover:to-emerald-700",
      features: ["Review Claims", "AI Insights", "Bulk Actions", "Analytics"]
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      company: "Metro Health System",
      content: "This platform has revolutionized how we handle insurance claims. The AI assistance is incredibly accurate.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "HR Director",
      company: "TechCorp Inc.",
      content: "Our employees love how simple it is to submit claims. Processing time went from weeks to just 2 days.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Shield className="w-10 h-10 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  MediClaim AI
                </span>
                <p className="text-xs text-gray-500 font-medium">Intelligent Insurance Processing</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#portals" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Portals</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Reviews</a>
              <button className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              <span>AI-Powered • HIPAA Compliant • 99.2% Accuracy</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Transform Your
              <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-green-600 bg-clip-text text-transparent block">
                Insurance Claims
              </span>
              <span className="text-4xl md:text-5xl text-gray-700">with AI Intelligence</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience lightning-fast claim processing with our revolutionary AI platform. 
              Submit, verify, and approve medical insurance claims in minutes, not weeks.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <Link 
                to="/login"
                className="group bg-gradient-to-r from-blue-600 to-teal-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <span>Start Your Claim</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              {/* <button className="group border-2 border-gray-300 text-gray-700 px-10 py-5 rounded-2xl font-bold text-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center justify-center space-x-3">
                <Play className="w-6 h-6" />
                <span>Watch Demo</span>
              </button> */}
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600">50K+</div>
                <div className="text-sm text-gray-600 font-medium">Claims Processed</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-teal-600">2 Min</div>
                <div className="text-sm text-gray-600 font-medium">Avg Processing</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-600">99.2%</div>
                <div className="text-sm text-gray-600 font-medium">Accuracy Rate</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-600 font-medium">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-teal-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              <span>Industry Leading Technology</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the future of insurance claim processing with cutting-edge AI technology 
              that delivers unmatched speed, accuracy, and user experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-4"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-teal-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="mb-6 p-4 bg-gray-50 rounded-2xl w-fit group-hover:bg-white group-hover:shadow-lg transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div className="mb-3">
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                      {feature.highlight}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <AICapabilitiesSection />

      {/* Portals Section */}
      <section id="portals" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-100 to-green-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              <span>Three Specialized Portals</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Access Point
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Each portal is specifically designed for your role in the healthcare ecosystem, 
              providing tailored tools and workflows for maximum efficiency.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {portals.map((portal, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Gradient Header */}
                <div className={`bg-gradient-to-br ${portal.gradient} ${portal.hoverGradient} p-8 text-white relative overflow-hidden transition-all duration-300`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                  
                  <div className="relative z-10">
                    <div className="mb-6 p-4 bg-white/20 rounded-2xl w-fit group-hover:bg-white/30 transition-all duration-300">
                      {portal.icon}
                    </div>
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold mb-1">{portal.title}</h3>
                      <p className="text-lg opacity-90 font-medium">{portal.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <p className="text-gray-600 leading-relaxed mb-6">{portal.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {portal.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    to={portal.link}
                    className="group/btn w-full bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Access Portal</span>
                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our streamlined process makes claim submission and approval effortless
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Submit Claim", desc: "Upload documents and fill out the claim form", icon: <FileText className="w-8 h-8" /> },
              { step: "02", title: "AI Verification", desc: "Our AI instantly verifies documents and checks eligibility", icon: <Bot className="w-8 h-8" /> },
              { step: "03", title: "Expert Review", desc: "Insurance experts review flagged cases for accuracy", icon: <UserCheck className="w-8 h-8" /> },
              { step: "04", title: "Instant Approval", desc: "Get approved claims processed and paid within hours", icon: <CheckCircle className="w-8 h-8" /> }
            ].map((step, index) => (
              <div key={index} className="relative text-center group">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <div className="text-sm font-bold text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-full w-full">
                    <ArrowRight className="w-6 h-6 text-gray-300 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-blue-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by Healthcare Leaders
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              See what industry professionals are saying about our platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-lg mb-6 leading-relaxed opacity-95">"{testimonial.content}"</p>
                <div>
                  <p className="font-bold text-lg">{testimonial.name}</p>
                  <p className="opacity-80">{testimonial.role}</p>
                  <p className="text-sm opacity-70">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Claims Process?
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Join thousands of healthcare professionals who have already revolutionized 
            their insurance claim workflows with our AI-powered platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link 
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Get Started Now
            </Link>
            <button className="border-2 border-gray-600 text-gray-300 px-10 py-5 rounded-2xl font-bold text-lg hover:border-white hover:text-white transition-all duration-300">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <Shield className="w-10 h-10 text-blue-400" />
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                    MediClaim AI
                  </span>
                  <p className="text-xs text-gray-400">Intelligent Insurance Processing</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                Revolutionizing medical insurance claim processing with artificial intelligence, 
                making healthcare more accessible and efficient for everyone.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Portals</h4>
              <ul className="space-y-3">
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><ChevronRight className="w-4 h-4" /><span>Employee Portal</span></Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><ChevronRight className="w-4 h-4" /><span>Doctor Portal</span></Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"><ChevronRight className="w-4 h-4" /><span>Insurance Portal</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Resources</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status Page</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; 2025 MediClaim AI. All rights reserved. Built with ❤️ for healthcare.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">Certified:</span>
                <div className="flex items-center space-x-4">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">HIPAA</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">SOC 2</span>
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">ISO 27001</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
