import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, MapPin, TrendingUp, Users, Award, DollarSign, Target, Star, ArrowLeft, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";

const licenseeBenefits = [{
  icon: TrendingUp,
  title: "High-Growth Industry",
  description: "Capitalize on the rapidly expanding wellness and recovery market that's projected to grow exponentially."
}, {
  icon: CheckCircle,
  title: "Turnkey System",
  description: "Benefit from our comprehensive training, marketing support, and proven business model."
}, {
  icon: MapPin,
  title: "Prime Territories",
  description: "Secure exclusive territories in high-demand markets across the United States."
}, {
  icon: Users,
  title: "Dedicated Support Team",
  description: "Access our experienced team of business consultants and industry experts."
}, {
  icon: Award,
  title: "Proven Success",
  description: "Join a network of successful licensees who are already generating substantial returns."
}, {
  icon: DollarSign,
  title: "Multiple Revenue Streams",
  description: "Generate income from services, retail sales, memberships, and corporate partnerships."
}];

const licenseeFeatures = [
  "Comprehensive training program and ongoing support",
  "Established brand with proven market demand",
  "Multiple revenue streams (services and product sales)",
  "Marketing and customer acquisition systems",
  "Dedicated license success team",
  "Exclusive supply chain and vendor relationships",
  "All equipment included (cold plunges, hyperbaric chambers, and more)",
  "Grand opening marketing campaign",
  "Ongoing operational guidance",
  "Access to proprietary software systems",
  "Protected territory rights",
  "Corporate partnership opportunities"
];

const successStories = [
  {
    name: "Sarah Johnson",
    location: "Phoenix, AZ",
    achievement: "ROI in 8 months",
    quote: "REST RECOVERY has transformed not just my business, but my entire community's approach to wellness."
  },
  {
    name: "Mike Chen",
    location: "Denver, CO", 
    achievement: "3x revenue growth",
    quote: "The support system and proven model made scaling my business seamless and profitable."
  },
  {
    name: "Lisa Rodriguez",
    location: "Miami, FL",
    achievement: "2 locations opened",
    quote: "Starting with one location and now expanding to my second - the REST RECOVERY model works!"
  }
]; 

const stats = [
  {
    icon: MapPin,
    number: "25+",
    label: "Active Locations"
  },
  {
    icon: Users,
    number: "6 mo",
    label: "Open in 6 months"
  },
  {
    icon: TrendingUp,
    number: "100%",
    label: "9–12 months repayment"
  },
  {
    icon: ShoppingBag,
    number: "24/7",
    label: "Support Available"
  }
];

const Licensee = () => {
  const scrollToContact = () => {
    const contactElement = document.getElementById('contact');
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-black via-gray-900 to-black py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Link to="/" className="inline-flex items-center text-yellow-400 hover:text-yellow-300 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <div className="inline-block px-6 py-3 bg-yellow-500/10 text-yellow-400 rounded-full font-medium mb-6 border border-yellow-500/30">
              Licensee Opportunities
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Own a 
              <span className="block text-yellow-400">REST RECOVERY</span>
              License
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join our growing network of wellness entrepreneurs who are transforming lives 
              through our proven recovery business model and generating substantial returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg rounded-full"
                onClick={scrollToContact}
              >
                Request License Info
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button
                variant="outline"
                className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black px-8 py-4 text-lg rounded-full"
                onClick={() => document.getElementById('investment-details')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Investment Details
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* News Features Section */}
      <section className="py-20 bg-gradient-to-b from-black via-yellow-950/10 to-black relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 rounded-full mb-6 backdrop-blur-sm">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold text-lg">AS SEEN ON THE NEWS</span>
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              REST RECOVERY Locations
              <span className="block text-yellow-400 mt-2">Making Headlines</span>
            </h2>
            <p className="text-xl text-white/70">
              See how our licensees are transforming their communities
            </p>
          </div>

          {/* Video Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Phoenix/Chandler Video */}
            <div className="group">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">Chandler, Arizona</h3>
                  <p className="text-white/60">ABC15 Arizona - Sonoran Living</p>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <div className="scripps_iframe_embed" style={{ position: 'relative' }}>
                    <div style={{ display: 'block', width: '100%', height: 'auto', paddingBottom: '56.25%' }}></div>
                    <iframe 
                      id="da-iframe" 
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      height="100%" 
                      frameBorder="0" 
                      scrolling="no" 
                      src="https://assets.scrippsdigital.com/cms/video/player.html?video=https://content.uplynk.com/72521260aa674ced8efee11d06d2f859.m3u8&mp4=https://cf.cdn.uplynk.com/ause1/slices/725/5c3d34b8b29a45469a86c02775b7a2cf/72521260aa674ced8efee11d06d2f859/72521260aa674ced8efee11d06d2f859_e.mp4&autoplay=false&purl=/lifestyle/sonoran-living/sl-sponsors/effective-wellness-and-anti-aging-treatments-all-in-one-place&da=1&poster=https://cf.cdn.uplynk.com/ause1/slices/725/5c3d34b8b29a45469a86c02775b7a2cf/72521260aa674ced8efee11d06d2f859/poster_6b62d2a011f049b8807f80a0cfbe60c6.jpg&title=Effective%20wellness%20and%20anti-aging%20treatments%20all%20in%20one%20place&kw=Chandler%2CRest%20Recover%2Canti-aging%2Ccold%20plunge%2Ccompression%2Cfloat%20spa%2Chealth%2Chyperbaric%20chamber%2Cnear%20infrared%2Cred%20light&contplay=*recent&mute=0&tags=Sonoran%20Living%2CApproved%20Sponsored%20Content%2CSL%20Sponsors&section=SL%20Sponsors&cust_params=temp%3D%26weather%3D&host=abc15.com&s=knxv&env=production&ex=1" 
                      allow="autoplay; fullscreen"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>

            {/* Roseville Video */}
            <div className="group">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">Roseville, California</h3>
                  <p className="text-white/60">FOX40 News - Studio 40 Live</p>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe 
                    id="nxs-video-iframe" 
                    data-frame-src="11062407" 
                    width="100%" 
                    height="100%" 
                    sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" 
                    src="https://redir1.fox40.com/nxs-video-player/eyJ2aWRlb19pZCI6IjExMDYyNDA3IiwicG9zdF9pZCI6MjM5NjAyNCwiYWR0YWdfdXJsIjoiYXR1X3AxP3N6PTF4MTAwMCZpdT1cLzU2NzhcL254Lmt0eGxcL3N0dWRpbzQwX2xpdmUmaW1wbD1zJmdkZnBfcmVxPTEmZW52PXZwJm91dHB1dD12bWFwJnVudmlld2VkX3Bvc2l0aW9uX3N0YXJ0PTEmYWRfcnVsZT0xJmRlc2NyaXB0aW9uX3VybD1hdHVfcDImdmNvbnA9MiZjdXN0X3BhcmFtcz12aWQ9MTEwNjI0MDcmc3RhdGlvbj1LVFhMJmNtc2lkPTIzOTYwMjQmcGlkPTIzOTYwMjQmcGVyc19jaWQ9bnhzdHJpYi0xMy1hcnRpY2xlLTIzOTYwMjQmdmlkY2F0PVwvc3R1ZGlvNDBfbGl2ZSZib2JfY2s9W2JvYl9ja192YWxdJmRfY29kZT0xJnBhZ2V0eXBlPXN0b3J5JmhsbWV0YT1yZXN0IHJlY292ZXJ5IHJvc2V2aWxsZSZhYT1mIiwicG9zdF90eXBlIjoicG9zdCIsImluamVjdGVkX3ZpYSI6ImFtcCIsImFkX3Byb3ZpZGVyIjoiZ2FtIiwiaW5fd3BfZWRpdG9yIjpmYWxzZSwiYWxsb3dfYXV0b3BsYXkiOnRydWUsImlzX2xpdmVibG9nIjpmYWxzZX0=" 
                    scrolling="no" 
                    frameBorder="0" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Meridian/Boise Blog Post */}
            <div className="group">
              <a 
                href="https://www.thatboisegirl.com/blog/rest-recovery-wellness-meridian-idaho"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 h-full">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">Meridian, Idaho</h3>
                    <p className="text-white/60">That Boise Girl Blog</p>
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden bg-black mb-4">
                    <img 
                      src="https://images.squarespace-cdn.com/content/v1/645a2f69fa79872fb6760545/97381f77-fce6-4cd5-bdd8-f479d41a0de4/Rest+Recovery+Wellness+Therapy+Meridian+Idaho+Cold+Plunge+Float+Tank+Red+Light+Sauna+Compression+Body+Contouring+9.jpg"
                      alt="REST RECOVERY Wellness - Meridian, Idaho"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-white/70 text-sm mb-3 line-clamp-3">
                    &ldquo;My family and I have been loving going to Rest Recovery Wellness in Meridian… their facility is clean and calming and the pricing they are offering for everything they offer is unmatched!&rdquo;
                  </p>
                  <div className="flex items-center text-yellow-400 font-semibold group-hover:gap-3 transition-all">
                    Read Full Article
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Why Choose REST RECOVERY?
            </h2>
            <p className="text-lg text-white/70">
              Partner with a proven brand that's revolutionizing the wellness industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {licenseeBenefits.map((benefit, index) => (
              <div key={index} className="bg-black/40 border border-yellow-500/20 p-8 rounded-2xl backdrop-blur-md hover:border-yellow-400/40 transition-all group">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-yellow-500/20 transition-colors">
                  <benefit.icon size={28} className="text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">{benefit.title}</h3>
                <p className="text-white/70">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features & Investment Details Section */}
      <section id="investment-details" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 md:p-12 border border-white/10 backdrop-blur-md">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-3xl font-bold mb-8 text-white">What's Included</h3>
                <ul className="space-y-4 mb-8">
                  {licenseeFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="mr-3 mt-1 flex-shrink-0 text-yellow-400" size={20} />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-8">
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-yellow-500/20">
                  <h4 className="text-2xl font-semibold mb-6 text-white flex items-center">
                    <Target className="mr-3 text-yellow-400" size={24} />
                    Investment Details
                  </h4>
                  <div className="space-y-6">
                    <div className="border-b border-white/10 pb-4">
                      <div className="text-4xl font-bold mb-2 text-yellow-400">$35,000</div>
                      <p className="text-white/70">Initial down payment</p>
                    </div>
                    <div className="border-b border-white/10 pb-4">
                      <div className="text-4xl font-bold mb-2 text-white">$180K - $250K</div>
                      <p className="text-white/70">Total investment range</p>
                    </div>
                    <div>
                      <div className="text-4xl font-bold mb-2 text-yellow-400">$400K - $700K</div>
                      <p className="text-white/70">Average yearly income potential</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-yellow-500/20">
                  <h4 className="text-2xl font-semibold mb-6 text-white flex items-center">
                    <MapPin className="mr-3 text-yellow-400" size={24} />
                    Available Territories
                  </h4>
                  <p className="text-white/70 mb-6 text-lg">
                    We're expanding nationwide and looking for qualified partners in markets across the United States.
                  </p>
                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-full"
                    onClick={scrollToContact}
                  >
                    Find a Location Near You
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Success Stories
            </h2>
            <p className="text-lg text-white/70">
              Real results from our licensee partners across the country
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-black/40 border border-yellow-500/20 p-8 rounded-2xl backdrop-blur-md">
                <div className="flex items-center mb-4">
                  <Star className="text-yellow-400 mr-2" size={20} />
                  <span className="text-yellow-400 font-semibold">{story.achievement}</span>
                </div>
                <blockquote className="text-white/80 mb-6 italic">
                  "{story.quote}"
                </blockquote>
                <div className="border-t border-white/10 pt-4">
                  <div className="font-semibold text-white">{story.name}</div>
                  <div className="text-white/60">{story.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Coming Soon
            </h2>
            <p className="text-lg text-white/70">
              New territories opening soon - be the first to secure your market
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {["Texas", "North Dakota", "Maryland", "Virginia", "Tennessee"].map((state, index) => (
              <div key={index} className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 p-6 rounded-xl backdrop-blur-md text-center group hover:border-yellow-400 transition-all">
                <MapPin className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{state}</h3>
                <p className="text-yellow-400 text-sm font-medium">Opening 2026</p>
              </div>
            ))}
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/10 transition-colors">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-white/60 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-t border-yellow-500/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Take the first step toward owning a profitable wellness business. 
            Contact us today to learn more about available territories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg rounded-full"
              onClick={scrollToContact}
            >
              Get Started Today
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button
              variant="outline"
              className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black px-8 py-4 text-lg rounded-full"
              onClick={() => window.open('tel:+1-555-REST-REC', '_self')}
            >
              Call Us Now
            </Button>
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </div>
  );
};

export default Licensee;