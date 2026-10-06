import { ShieldCheck, Award, FileCheck, Truck, Headphones, Lock } from 'lucide-react';

export default function TrustSection() {
  const trustPillars = [
    {
      icon: ShieldCheck,
      title: '150-Point Inspection',
      description: 'Every vehicle undergoes rigorous mechanical, electronic, and structural verification by certified luxury automotive specialists.'
    },
    {
      icon: FileCheck,
      title: 'Authenticated Service History',
      description: 'Transparent history reports, mileage verification, and original title documentation provided with every single acquisition.'
    },
    {
      icon: Award,
      title: 'Bako Luxury Warranty',
      description: 'Comprehensive powertrain protection and complimentary 1-year roadside concierge service included on all qualifying vehicles.'
    },
    {
      icon: Truck,
      title: 'Nationwide Express Delivery',
      description: 'White-glove, enclosed transport directly to your doorstep or private estate anywhere across the country.'
    },
    {
      icon: Headphones,
      title: 'Dedicated Concierge',
      description: 'Personalized 24/7 advisor support for trade-ins, custom spec orders, registration, and ongoing vehicle maintenance.'
    },
    {
      icon: Lock,
      title: 'Secure Settlement',
      description: 'Flexible payment structures, instant bank wire verification, and tailored high-net-worth financing arrangements.'
    }
  ];

  return (
    <div className="py-12 bg-black border border-white/10 p-6 sm:p-10">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h3 className="font-sans text-xl sm:text-2xl font-bold tracking-[0.2em] text-white uppercase">
          THE BAKO INTEGRITY GUARANTEE
        </h3>
        <p className="text-white/50 text-xs font-mono uppercase tracking-widest mt-2">
          UNCOMPROMISED ACCURACY & PEACE OF MIND WITH EVERY KEY HANDOVER
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {trustPillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div key={idx} className="border border-white/10 p-6 bg-zinc-950/50 hover:border-white/30 transition-colors">
              <div className="w-10 h-10 border border-white/20 flex items-center justify-center mb-4 bg-white/5 text-white">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-sans text-sm font-bold tracking-wider text-white uppercase mb-2">
                {pillar.title}
              </h4>
              <p className="text-xs text-white/60 font-mono leading-relaxed uppercase tracking-wider">
                {pillar.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
