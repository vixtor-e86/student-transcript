import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest text-sage">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-forest" />
              </div>
              <span className="font-semibold text-sm tracking-wide">
                FEDPOLYNAS RECORDS
              </span>
            </div>
            <p className="text-sm text-moss leading-relaxed">
              Automating the process of requesting, processing, and issuing
              academic transcripts for Federal Polytechnic Nasarawa.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium uppercase tracking-[0.15em] text-gold">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {['Student Portal', 'Admin Portal', 'About Project'].map(
                (item) => (
                  <li key={item}>
                    <span className="text-sm text-moss hover:text-sage transition-colors cursor-default">
                      {item}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium uppercase tracking-[0.15em] text-gold">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-moss">
                <Mail className="w-4 h-4 text-gold" />
                records@fedpolynas.edu.ng
              </li>
              <li className="flex items-center gap-2 text-sm text-moss">
                <Phone className="w-4 h-4 text-gold" />
                +234 123 456 7890
              </li>
              <li className="flex items-start gap-2 text-sm text-moss">
                <MapPin className="w-4 h-4 text-gold mt-0.5" />
                Nasarawa, Nasarawa State, Nigeria
              </li>
            </ul>
          </div>

          {/* Objectives */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium uppercase tracking-[0.15em] text-gold">
              Project Objectives
            </h4>
            <ul className="space-y-2">
              {[
                'Automate transcript requests',
                'Centralized academic records',
                'Reduce processing time',
                'Improve accuracy & security',
              ].map((obj) => (
                <li key={obj} className="text-xs text-moss leading-relaxed">
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-olive/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-moss">
            &copy; {new Date().getFullYear()} FedPolyNasRecords. Final Project —
            Transcript Management System.
          </p>
          <p className="text-xs text-moss">
            Federal Polytechnic Nasarawa.
          </p>
        </div>
      </div>
    </footer>
  );
}
