import React from 'react';
import { Github, Instagram, Linkedin, Facebook, Globe } from 'lucide-react';

export default function Footer() {
  const socialLinks = [
    { icon: Globe, href: 'https://sunnygupta.dev', label: 'Website' },
    { icon: Github, href: 'https://github.com/sunny', label: 'GitHub' },
    { icon: Instagram, href: 'https://instagram.com/sunny', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/in/sunny', label: 'LinkedIn' },
    { icon: Facebook, href: 'https://facebook.com/sunny', label: 'Facebook' },
  ];

  return (
    <footer className="mt-8 pb-6 text-center">
      <div className="flex justify-center gap-4 mb-3">
        {socialLinks.map(({ icon: Icon, href, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-custom-sage hover:text-custom-cream transition-colors"
            aria-label={label}
          >
            <Icon className="w-5 h-5" />
          </a>
        ))}
      </div>
      <p className="text-custom-cream text-sm">
        Made by Sunny Gupta with Love 💖
      </p>
    </footer>
  );
}