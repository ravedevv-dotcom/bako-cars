/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Mail, Phone, MapPin, Clock, CheckCircle2, Compass, MessageCircle, Instagram } from 'lucide-react';
import { motion } from 'motion/react';

export default function ContactSection() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userMsg, setUserMsg] = useState('');

  const handleInquirySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !userMsg) return;

    // Trigger direct email dispatch to bakocarsltd@yahoo.com
    const mailSubject = encodeURIComponent(`Showroom Message from ${name}`);
    const mailBody = encodeURIComponent(`Full Name: ${name}\nEmail: ${email}\nMobile Number: ${phone}\n\nMessage / Intent:\n${userMsg}`);
    
    // Open mail client addressed to bakocarsltd@yahoo.com
    window.location.href = `mailto:bakocarsltd@yahoo.com?subject=${mailSubject}&body=${mailBody}`;

    setFormSubmitted(true);
  };

  const locations = [
    {
      title: 'BAKO CARS ABUJA SHOWROOM',
      address: '2FWF+FH2, behind Tsukunda House, Abuja 900103, Nigeria',
      coords: '9.0765° N, 7.4983° E',
      tel: '07058099349 | 08167332017',
      email: 'bakocarsltd@yahoo.com'
    }
  ];

  return (
    <div className="glass rounded-none p-6 sm:p-8 lg:p-10 shadow-xl glow" id="contact-section-container">
      <div className="text-center md:text-left mb-8 border-b border-white/10 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <MapPin className="w-6 h-6 text-white mb-2 mx-auto md:mx-0 animate-bounce" />
          <h2 className="font-sans text-xl sm:text-2xl font-black text-white tracking-[0.2em] uppercase">VISIT OUR SHOWROOM</h2>
          <p className="text-xs font-mono text-white/40 mt-1 tracking-widest uppercase">LOCATED BEHIND TSUKUNDA HOUSE, ABUJA, NIGERIA • EST. 2020</p>
        </div>

        {/* Quick Social & Direct Chat Action Buttons */}
        <div className="flex items-center justify-center md:justify-end gap-3 shrink-0">
          <a
            href="https://wa.me/message/JCOUM7I4Z2XVB1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-green-600 hover:bg-green-500 text-white font-mono text-[9.5px] font-bold uppercase tracking-wider px-3.5 py-2 transition-all shadow-md"
            id="chat-whatsapp-contact-btn"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>CHAT ON WHATSAPP</span>
          </a>
          <a
            href="https://www.instagram.com/bakocars_/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-mono text-[9.5px] font-bold uppercase tracking-wider px-3.5 py-2 transition-all shadow-md hover:brightness-110"
            id="dm-instagram-contact-btn"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>CHAT ON INSTAGRAM</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: Details & Map representation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            {locations.map((loc, idx) => (
              <div key={idx} className="space-y-3.5 bg-black border border-white/10 p-5 rounded-none">
                <h3 className="font-sans text-xs font-bold tracking-[0.2em] text-white uppercase">{loc.title}</h3>
                
                <div className="space-y-2 text-xs text-white/70">
                  <p className="flex items-start space-x-2.5">
                    <MapPin className="w-4 h-4 text-white flex-shrink-0" />
                    <span>{loc.address}</span>
                  </p>
                  <p className="flex items-center space-x-2.5 pl-6 font-mono text-[9px] text-white/40 tracking-widest uppercase">
                    <span>COORDINATES: {loc.coords}</span>
                  </p>
                  <p className="flex items-center space-x-2.5">
                    <Phone className="w-4 h-4 text-white flex-shrink-0" />
                    <span className="font-mono text-white">{loc.tel}</span>
                  </p>
                  <p className="flex items-center space-x-2.5">
                    <Mail className="w-4 h-4 text-white flex-shrink-0" />
                    <a href={`mailto:${loc.email}`} className="hover:text-white transition-colors text-sky-400 font-mono">{loc.email}</a>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Dealership Hours */}
          <div className="bg-black border border-white/10 p-5 rounded-none space-y-3">
            <h3 className="font-sans text-xs font-bold tracking-[0.2em] text-white uppercase flex items-center space-x-2">
              <Clock className="w-4 h-4 text-white" />
              <span>SHOWROOM SCHEDULE</span>
            </h3>

            <div className="space-y-2 font-mono text-[10px] text-white/60 tracking-wider">
              <div className="flex justify-between border-b border-white/10 pb-1.5 uppercase">
                <span>MON - SAT:</span>
                <span className="text-white font-medium">9:00 AM - 7:00 PM</span>
              </div>
              <div className="flex justify-between text-white uppercase">
                <span>SUNDAY Showroom</span>
                <span className="font-bold underline text-sky-400">APPOINTMENT ONLY</span>
              </div>
            </div>
          </div>

          {/* Map Mockup representation */}
          <div className="relative h-44 rounded-none bg-black border border-white/10 overflow-hidden flex flex-col justify-end p-4 group">
            {/* Styled Dark Grid Map texture */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="h-6 w-6 rounded-none bg-white/20 border border-white flex items-center justify-center animate-ping" />
              <div className="h-3 w-3 bg-white rounded-none border border-black absolute top-1.5" />
            </div>
            
            <div className="absolute inset-x-0 top-1/3 h-[1px] bg-white/10 rotate-12" />
            <div className="absolute inset-y-0 left-1/3 w-[1px] bg-white/10 -rotate-12" />
            <div className="absolute inset-x-0 top-2/3 h-[1px] bg-white/10 -rotate-3" />

            <div className="relative z-10 bg-black border border-white/20 p-3.5 rounded-none flex items-center justify-between">
              <div>
                <span className="block text-[8px] font-mono text-white/40 uppercase tracking-widest">ABUJA HQ</span>
                <span className="block font-sans text-[10px] font-bold text-white tracking-[0.2em] uppercase">BEHIND TSUKUNDA HOUSE</span>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Tsukunda%20House,%20Abuja,%20Nigeria"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 text-[9px] font-mono text-white border border-white/20 hover:border-white px-2.5 py-1 rounded-none bg-black hover:bg-white hover:text-black transition-all"
              >
                <Compass className="w-3 h-3 animate-spin duration-[10000ms]" />
                <span>OPEN DIRECTIONS</span>
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Universal Contact Intake form */}
        <div className="lg:col-span-7 bg-black border border-white/10 rounded-none p-5 sm:p-6 shadow-md">
          {!formSubmitted ? (
            <form onSubmit={handleInquirySubmit} className="space-y-4" id="universal-contact-form">
              <div className="pb-3 border-b border-white/10">
                <h3 className="font-sans text-sm font-bold tracking-[0.2em] uppercase text-white">DIRECT SHOWROOM MESSAGE</h3>
                <p className="text-[10px] font-mono text-white/40 tracking-wider mt-0.5 uppercase">SEND YOUR MESSAGE DIRECTLY TO BAKOCARSLTD@YAHOO.COM</p>
              </div>

              <div>
                <label htmlFor="contact-fullname" className="block text-[9px] font-mono text-white/40 uppercase tracking-[0.2em] mb-1.5">FULL NAME</label>
                <input
                  id="contact-fullname"
                  type="text"
                  required
                  placeholder="Your Full Name"
                  className="block w-full px-3.5 py-2.5 bg-black border border-white/20 rounded-none text-xs text-white focus:outline-none focus:border-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-email" className="block text-[9px] font-mono text-white/40 uppercase tracking-[0.2em] mb-1.5">YOUR EMAIL ADDRESS</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="yourname@example.com"
                    className="block w-full px-3.5 py-2.5 bg-black border border-white/20 rounded-none text-xs text-white focus:outline-none focus:border-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="contact-phone" className="block text-[9px] font-mono text-white/40 uppercase tracking-[0.2em] mb-1.5">MOBILE NUMBER</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    placeholder="e.g. 0816 733 2017"
                    className="block w-full px-3.5 py-2.5 bg-black border border-white/20 rounded-none text-xs text-white focus:outline-none focus:border-white"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-user-message" className="block text-[9px] font-mono text-white/40 uppercase tracking-[0.2em] mb-1.5">YOUR MESSAGE / INQUIRY</label>
                <textarea
                  id="contact-user-message"
                  required
                  rows={4}
                  placeholder="Type your vehicle inquiry, trade-in info, or scheduling request here..."
                  className="block w-full px-3.5 py-2.5 bg-black border border-white/20 rounded-none text-xs text-white focus:outline-none focus:border-white"
                  value={userMsg}
                  onChange={(e) => setUserMsg(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white hover:bg-white/95 text-black font-sans text-xs font-bold tracking-[0.2em] py-3.5 rounded-none transition-all cursor-pointer shadow-lg shadow-white/5 uppercase flex items-center justify-center space-x-2"
                id="contact-form-submit-btn"
              >
                <Mail className="w-4 h-4 text-black" />
                <span>SEND</span>
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 px-4 space-y-4"
              id="showroom-contact-success"
            >
              <div className="relative inline-flex items-center justify-center w-12 h-12 bg-white/10 border border-white/30 rounded-none">
                <CheckCircle2 className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-bold tracking-[0.2em] uppercase text-white">MESSAGE DISPATCHED TO BAKO CARS</h3>
                <p className="text-[9px] font-mono text-sky-400 tracking-widest mt-1 uppercase">DESTINATION: BAKOCARSLTD@YAHOO.COM</p>
              </div>
              <p className="text-white/70 text-xs leading-relaxed max-w-md mx-auto">
                Thank you, <span className="font-bold text-white">{name}</span>. Your inquiry message has been compiled and dispatched to <span className="text-white font-bold">bakocarsltd@yahoo.com</span>. Our Abuja concierge team will contact you shortly via email or phone at <span className="text-white font-bold">{phone}</span>.
              </p>
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormSubmitted(false);
                    setName('');
                    setEmail('');
                    setPhone('');
                    setUserMsg('');
                  }}
                  className="px-6 py-2.5 border border-white/20 bg-black hover:border-white hover:text-white text-[9px] font-mono rounded-none tracking-widest transition-colors cursor-pointer uppercase"
                >
                  SEND ANOTHER MESSAGE
                </button>
                <a
                  href="https://wa.me/message/JCOUM7I4Z2XVB1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white text-[9px] font-mono font-bold rounded-none tracking-widest transition-colors cursor-pointer uppercase flex items-center space-x-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>CONTINUE ON WHATSAPP</span>
                </a>
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}

