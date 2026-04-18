"use client";
import React from "react";
import { Instagram, Youtube, MessageCircle, Send, Mail, Phone, ExternalLink } from "lucide-react";

const footerSections = [
  {
    title: "About Academy",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Counseling", href: "/counseling" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Success Hub",
    links: [
      { label: "College Predictor", href: "/predictor" },
      { label: "Rank Analysis", href: "/percentile" },
      { label: "Percentile Converter", href: "/percentile" },
      { label: "Early Predictor", href: "/jee-early-predictor" },
    ],
  },
  {
    title: "College Guide",
    links: [
      { label: "IITs List", href: "/colleges" },
      { label: "NITs List", href: "/colleges" },
      { label: "IIITs List", href: "/colleges" },
      { label: "Other Colleges", href: "/colleges" },
    ],
  },
  {
    title: "Insights",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Refund Policy", href: "/refund" },
    ],
  },
];

const socialLinks = [
  {
    label: "Telegram",
    href: "https://t.me/wewonacademy",
    icon: Send,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/aman.bhaiya_iiser?igsh=MWc5OTN6MGNsYjhkaw==",
    icon: Instagram,
  },
  {
    label: "WhatsApp",
    href: "https://whatsapp.com/channel/0029VamIMTD9WtC9n8tEs21V",
    icon: MessageCircle,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@WeWonAcademy/videos",
    icon: Youtube,
  },
];

const Footer = () => {
  return (
    <footer className="relative bg-[var(--primary)] pt-12 text-white">
      {/* Top Border with Accent */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10 opacity-30"></div>

      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              WE WON <span className="text-[var(--accent)]">ACADEMY</span>
            </h2>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              AI-driven insights and expert mentorship to bridge the gap to your dream college.
            </p>
            {/* Contact Micro-Section */}
            <div className="space-y-3 pt-2">
              <a href="mailto:wewonacademyhelpdesk@gmail.com" className="group flex items-center gap-3 text-xs text-white/40 hover:text-[var(--accent)] transition-colors">
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[var(--accent)]/10 transition-colors">
                  <Mail size={14} />
                </div>
                wewonacademyhelpdesk@gmail.com
              </a>
              <a href="tel:+919532845978" className="group flex items-center gap-3 text-xs text-white/40 hover:text-[var(--accent)] transition-colors">
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[var(--accent)]/10 transition-colors">
                  <Phone size={14} />
                </div>
                +91-9532845978
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]/60">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-[var(--accent)] transition-colors flex items-center group gap-1"
                    >
                      {link.label}
                      <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 pb-8">
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
            &copy; 2026 We Won Academy. All rights reserved.
          </p>

          {/* Compact Socials */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:bg-[var(--accent)] hover:text-[var(--primary)] hover:scale-110 active:scale-95 transition-all duration-300"
                aria-label={social.label}
              >
                <social.icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Extreme Bottom Bar */}
      <div className="bg-black/10 py-4 px-6 text-center border-t border-white/5">
        <p className="text-[10px] text-white/60 uppercase tracking-[0.3em] font-bold">
          Empowering Ambitions Since 2018
        </p>
      </div>
    </footer>
  );
};

export default Footer;
