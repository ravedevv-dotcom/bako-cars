/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from 'react';
import { X, Bell, CheckCircle2, ShieldCheck, Mail, Phone, User } from 'lucide-react';
import { motion } from 'motion/react';
import { Car } from './types';

interface PriceAlertModalProps {
  car: Car | null;
  onClose: () => void;
}

export default function PriceAlertModal({ car, onClose }: PriceAlertModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!car) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      id="price-alert-modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-black border border-white/20 w-full max-w-lg p-6 sm:p-8 rounded-none shadow-2xl relative glow"
        id="price-alert-modal-box"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white border border-white/10 hover:border-white bg-black transition-all cursor-pointer"
          id="close-price-alert-modal-btn"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
              <div className="p-3 bg-white/10 border border-white/20 rounded-none text-white">
                <Bell className="w-5 h-5 text-sky-400 animate-bounce" />
              </div>
              <div>
                <span className="font-mono text-[9px] text-sky-400 uppercase tracking-[0.2em] block font-bold">
                  PRICE NOTIFICATION ALERT
                </span>
                <h3 className="font-sans text-lg font-black text-white uppercase tracking-wider">
                  NOTIFY ME IF PRICE CHANGES
                </h3>
              </div>
            </div>

            {/* Vehicle Summary box */}
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-none flex items-center justify-between">
              <div>
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest block">SELECTED VEHICLE</span>
                <span className="font-sans text-xs font-bold text-white uppercase">{car.year} {car.make} {car.model}</span>
                <span className="font-mono text-[9px] text-white/50 block mt-0.5">STOCK NO: {car.stockNumber || 'N/A'}</span>
              </div>
              <span className="bg-green-600 text-white font-mono text-[9px] font-bold px-2.5 py-1 uppercase tracking-widest">
                INQUIRE LISTING
              </span>
            </div>

            <p className="text-white/70 text-xs leading-relaxed uppercase font-mono tracking-wider">
              Enter your details below to receive instant SMS & Email notifications when Bako Cars updates the official market valuation for this vehicle.
            </p>

            <div className="space-y-3.5">
              <div>
                <label htmlFor="alert-name" className="block text-[9px] font-mono text-white/40 uppercase tracking-[0.2em] mb-1">
                  FULL NAME
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-white/40 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="alert-name"
                    type="text"
                    required
                    placeholder="Your Full Name"
                    className="block w-full pl-9 pr-3.5 py-2.5 bg-black border border-white/20 rounded-none text-xs text-white focus:outline-none focus:border-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="alert-email" className="block text-[9px] font-mono text-white/40 uppercase tracking-[0.2em] mb-1">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="alert-email"
                    type="email"
                    required
                    placeholder="yourname@example.com"
                    className="block w-full pl-9 pr-3.5 py-2.5 bg-black border border-white/20 rounded-none text-xs text-white focus:outline-none focus:border-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="alert-phone" className="block text-[9px] font-mono text-white/40 uppercase tracking-[0.2em] mb-1">
                  PHONE NUMBER
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-white/40 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="alert-phone"
                    type="tel"
                    required
                    placeholder="e.g. 0816 733 2017"
                    className="block w-full pl-9 pr-3.5 py-2.5 bg-black border border-white/20 rounded-none text-xs text-white focus:outline-none focus:border-white"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-white hover:bg-white/90 text-black font-sans text-xs font-bold tracking-[0.2em] py-3.5 rounded-none transition-all cursor-pointer uppercase shadow-lg flex items-center justify-center space-x-2"
              id="subscribe-price-alert-submit-btn"
            >
              <Bell className="w-4 h-4 text-black" />
              <span>ACTIVATE PRICE ALERT</span>
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-green-600/20 border border-green-500 rounded-none flex items-center justify-center mx-auto text-green-400">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-bold tracking-[0.2em] uppercase text-white">PRICE ALERT ACTIVATED!</h3>
              <p className="text-[9px] font-mono text-sky-400 tracking-widest mt-1 uppercase">
                SUBSCRIPTION STORED FOR {car.make} {car.model}
              </p>
            </div>
            <p className="text-white/70 text-xs leading-relaxed max-w-sm mx-auto font-mono">
              Thank you, <span className="font-bold text-white">{name}</span>. We will automatically alert your email (<span className="text-white font-bold">{email}</span>) and phone (<span className="text-white font-bold">{phone}</span>) as soon as Bako Cars updates the pricing for this vehicle.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-white/20 bg-black hover:border-white hover:text-white text-[10px] font-mono rounded-none tracking-widest transition-colors cursor-pointer uppercase"
            >
              DONE / CLOSE
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
