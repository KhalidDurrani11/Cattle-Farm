'use client';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function ContactPage() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-earth-500 text-lg">Get in touch with the AgriTradeX team</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="glass-card rounded-2xl p-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-earth-500">Phone</p>
                  <p className="font-medium text-foreground">+92 300 000 0000</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-earth-500">Email</p>
                  <p className="font-medium text-foreground">support@agritradex.pk</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-earth-500">Address</p>
                  <p className="font-medium text-foreground">Lahore, Punjab, Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card rounded-2xl p-8">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent! We will get back to you soon.'); }}>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Your Name</label>
                <input type="text" className="input-field" placeholder="Enter your name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                <input type="email" className="input-field ltr-only" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                <textarea className="input-field resize-none" rows={4} placeholder="How can we help you?" required />
              </div>
              <button type="submit" className="btn-primary w-full">
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Support Hours */}
        <div className="mt-12 text-center">
          <p className="text-earth-500">
            Our support team is available Monday to Friday, 9:00 AM - 6:00 PM (PKT)
          </p>
        </div>
      </div>
    </div>
  );
}
