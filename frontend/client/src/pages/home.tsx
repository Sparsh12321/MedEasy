import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import CategoryGrid from "@/components/category-grid";
import MedicineCard from "@/components/medicine-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Truck, 
  Award, 
  Headphones,
  Pill,
  MapPin,
  Clipboard,
  Video,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram
} from "lucide-react";
import { Link } from "wouter";
import type { MedicineWithInventory } from "@shared/schema";

export default function Home() {
  const { data: medicines, isLoading } = useQuery<MedicineWithInventory[]>({
    queryKey: ['/api/medicines'],
  });

  const featuredMedicines = medicines?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner */}
      <section className="relative gradient-bg text-white" data-testid="hero-banner">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-hero-title">
                Your Complete<br />
                <span className="text-yellow-300">Medicine Platform</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100" data-testid="text-hero-description">
                Connecting consumers, retailers, and wholesalers with real-time medicine availability and seamless ordering.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/search">
                  <Button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors" data-testid="button-order-medicine">
                    Order Medicine
                  </Button>
                </Link>
                <Button variant="outline" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors" data-testid="button-find-store">
                  Find Nearby Store
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Healthcare professionals with digital tablets" 
                className="rounded-2xl shadow-2xl w-full h-auto"
                data-testid="img-hero"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 bg-muted/30" data-testid="quick-actions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/search">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center" data-testid="action-order-medicine">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Pill className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Order Medicine</h3>
                <p className="text-sm text-muted-foreground">Quick medicine delivery</p>
              </div>
            </Link>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center" data-testid="action-find-store">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Find Store</h3>
              <p className="text-sm text-muted-foreground">Locate nearby pharmacy</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center" data-testid="action-upload-prescription">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clipboard className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Upload Prescription</h3>
              <p className="text-sm text-muted-foreground">Easy prescription upload</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center" data-testid="action-consult-doctor">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Consult Doctor</h3>
              <p className="text-sm text-muted-foreground">Online consultation</p>
            </div>
          </div>
        </div>
      </section>

      

      {/* Featured Medicines */}
      <section className="py-16 bg-muted/30" data-testid="featured-medicines">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4" data-testid="text-medicines-title">All Medicines</h2>
              <p className="text-muted-foreground" data-testid="text-medicines-subtitle">Most ordered medicines by our customers</p>
            </div>
            <Link href="/search">
              <Button variant="link" className="text-primary hover:underline font-semibold p-0" data-testid="button-view-all-medicines">
                View All
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="medicines-loading">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse overflow-hidden">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="medicines-grid">
              {featuredMedicines.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-muted/30" data-testid="trust-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-trust-title">Why Choose MedEasy?</h2>
            <p className="text-muted-foreground" data-testid="text-trust-subtitle">Trusted by thousands of customers, retailers, and wholesalers</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" data-testid="trust-badges">
            <div className="text-center" data-testid="badge-authentic">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Authentic</h3>
              <p className="text-muted-foreground">All medicines are sourced directly from authorized distributors</p>
            </div>
            
            <div className="text-center" data-testid="badge-delivery">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">Get your medicines delivered within 2-24 hours</p>
            </div>
            
            <div className="text-center" data-testid="badge-licensed">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Licensed Pharmacies</h3>
              <p className="text-muted-foreground">All partner pharmacies are licensed and verified</p>
            </div>
            
            <div className="text-center" data-testid="badge-support">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-muted-foreground">Round-the-clock customer support for all your needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div data-testid="footer-brand">
              <div className="text-2xl font-bold text-white mb-4">
                Med<span className="text-secondary">Easy</span>
              </div>
              <p className="text-gray-300 mb-4">
                Your trusted partner for all medicine needs. Connecting consumers, retailers, and wholesalers.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors" data-testid="link-facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors" data-testid="link-twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors" data-testid="link-instagram">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div data-testid="footer-links">
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/search" className="hover:text-white transition-colors" data-testid="footer-link-order">Order Medicine</Link></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-find">Find Store</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-prescription">Upload Prescription</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-consult">Consult Doctor</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-tests">Lab Tests</a></li>
              </ul>
            </div>
            
            <div data-testid="footer-support">
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-help">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-contact">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-track">Track Order</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-return">Return Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-terms">Terms & Conditions</a></li>
              </ul>
            </div>
            
            <div data-testid="footer-contact">
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center" data-testid="footer-phone">
                  <Phone className="w-4 h-4 mr-3" />
                  1800-123-4567
                </li>
                <li className="flex items-center" data-testid="footer-email">
                  <Mail className="w-4 h-4 mr-3" />
                  support@medeasy.com
                </li>
                <li className="flex items-start" data-testid="footer-address">
                  <MapPin className="w-4 h-4 mr-3 mt-1" />
                  123 Healthcare Street,<br />
                  Medical District, Delhi 110001
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8" data-testid="footer-bottom">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400" data-testid="text-copyright">© 2024 MedEasy. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="footer-link-privacy">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="footer-link-terms-service">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" data-testid="footer-link-cookies">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border md:hidden z-40" data-testid="mobile-nav">
        <div className="flex items-center justify-around py-2">
          <Link href="/" className="flex flex-col items-center py-2 px-3 text-primary" data-testid="mobile-nav-home">
            <Pill className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center py-2 px-3 text-muted-foreground" data-testid="mobile-nav-search">
            <MapPin className="w-5 h-5" />
            <span className="text-xs mt-1">Search</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center py-2 px-3 text-muted-foreground" data-testid="mobile-nav-dashboard">
            <Clipboard className="w-5 h-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <a href="#" className="flex flex-col items-center py-2 px-3 text-muted-foreground" data-testid="mobile-nav-cart">
            <Badge className="relative">
              <Pill className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </Badge>
            <span className="text-xs mt-1">Cart</span>
          </a>
          <a href="#" className="flex flex-col items-center py-2 px-3 text-muted-foreground" data-testid="mobile-nav-more">
            <Video className="w-5 h-5" />
            <span className="text-xs mt-1">More</span>
          </a>
        </div>
      </div>
    </div>
  );
}
