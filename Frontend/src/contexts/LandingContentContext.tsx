import React, { createContext, useContext, useState, useEffect } from 'react';

import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import awarenessImg from "@/assets/awareness.jpg";

export interface LandingContent {
  navbar: {
    brand: string;
    logoUrl: string;
    loginText: string;
    links: Array<{ label: string; path: string }>;
  };
  hero: {
    title: string;
    subtitle: string;
    buttonText: string;
    images: string[];
  };
  howItWorks: {
    title: string;
    subtitle: string;
    steps: Array<{ title: string; description: string }>;
  };
  awareness: {
    title: string;
    description: string;
    image: string;
  };
  aboutPreview: {
    title: string;
    description: string;
    buttonText: string;
    stats: string[];
  };
  aboutPage: {
    title: string;
    description: string;
    mission: string;
    values: Array<{ title: string; text: string }>;
  };
  contact: {
    title: string;
    email: string;
    phone: string;
    address: string;
  };
  footer: {
    brandName: string;
    copyright: string;
    socialLinks: Array<{ label: string; href: string }>;
  };
}

const defaultContent: LandingContent = {
  navbar: {
    brand: 'AHINSA NGO',
    logoUrl: '/NGO_Logo.png',
    loginText: 'Login',
    links: [
      { label: 'Home', path: '/' },
      { label: 'About', path: '/about' },
      { label: 'Contact', path: '/contact' },
    ],
  },
  hero: {
    title: 'Together We Can Build an Alcohol-Free Society',
    subtitle: 'Helping lives recover and rebuild — one step at a time',
    buttonText: 'Get Help',
    images: [hero1, hero2, hero3],
  },
  howItWorks: {
    title: 'How It Works',
    subtitle: 'Our proven 4-step process helps patients recover and lead a healthy life.',
    steps: [
      { title: 'Register Patient', description: 'Easily register new patients with complete medical and personal details.' },
      { title: 'Provide Treatment', description: 'Assign doctors and create personalized treatment plans for recovery.' },
      { title: 'Track Progress', description: 'Monitor daily progress, medicines, and recovery milestones.' },
      { title: 'Recovery & Reintegration', description: 'Support patients in rebuilding their lives and rejoining society.' },
    ],
  },
  awareness: {
    title: 'Say No to Alcohol',
    description: 'Alcohol addiction is a growing crisis that destroys families and communities. At AHINSA NGO, we believe every individual deserves a chance at recovery. Our team of dedicated professionals provides compassionate care, evidence-based treatment, and the support needed to overcome addiction.\n\nTogether, we can break the cycle of alcohol abuse and help people rediscover their potential. Your support can change — and save — lives.',
    image: awarenessImg,
  },
  aboutPreview: {
    title: 'About AHINSA NGO',
    description: 'Founded with a mission to create a drug-free society, AHINSA NGO has been at the forefront of rehabilitation and de-addiction services. We provide holistic care encompassing physical, mental, and social recovery.',
    buttonText: 'Read More',
    stats: [
      '5,000+ patients rehabilitated',
      '50+ trained counselors and staff',
      '15+ years of service',
      '24/7 helpline and support',
    ],
  },
  aboutPage: {
    title: 'About AHINSA NGO',
    description: 'Founded in 2009, AHINSA NGO has been dedicated to combating alcohol abuse and helping individuals reclaim their lives through holistic rehabilitation programs, counseling, and community reintegration support.',
    mission: 'To create an alcohol-free society by providing accessible, quality rehabilitation services, raising awareness, and empowering communities to support individuals on their journey to recovery.',
    values: [
      { title: 'Compassion', text: 'We treat every individual with dignity and empathy.' },
      { title: 'Community', text: 'Building a network of support for lasting recovery.' },
      { title: 'Integrity', text: 'Transparent and ethical practices in everything we do.' },
      { title: 'Excellence', text: 'Committed to the highest standards of rehabilitation care.' },
    ],
  },
  contact: {
    title: 'Contact Us',
    email: '@ahinsaorg@gmail.com',
    phone: '+91 98765 43210',
    address: 'Navjeevan Outreach Drop-In Center (ODIC), Shiv Nagar, behind Govind Bagh, Thatipur, Gwalior – 474011, Madhya Pradesh',
  },
  footer: {
    brandName: 'AHINSA NGO',
    copyright: `© ${new Date().getFullYear()} AHINSA NGO. All rights reserved.`,
    socialLinks: [
      { label: 'Facebook', href: 'https://facebook.com' },
      { label: 'Twitter', href: 'https://twitter.com' },
      { label: 'Instagram', href: 'https://instagram.com' },
      { label: 'YouTube', href: 'https://youtube.com' },
    ],
  },
};

interface LandingContentContextType {
  content: LandingContent;
  updateContent: (content: LandingContent) => void;
  resetContent: () => void;
}

const LandingContentContext = createContext<LandingContentContextType | undefined>(undefined);

export const LandingContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<LandingContent>(defaultContent);

  useEffect(() => {
    const saved = localStorage.getItem('landingContent');
    if (saved) {
      try {
        const parsedContent = JSON.parse(saved);
        // Merge with defaultContent to ensure all fields exist
        const mergedContent: LandingContent = {
          navbar: { ...defaultContent.navbar, ...parsedContent.navbar },
          hero: { ...defaultContent.hero, ...parsedContent.hero },
          howItWorks: { ...defaultContent.howItWorks, ...parsedContent.howItWorks },
          awareness: { ...defaultContent.awareness, ...parsedContent.awareness },
          aboutPreview: { ...defaultContent.aboutPreview, ...parsedContent.aboutPreview },
          aboutPage: { ...defaultContent.aboutPage, ...parsedContent.aboutPage },
          contact: { ...defaultContent.contact, ...parsedContent.contact },
          footer: { ...defaultContent.footer, ...parsedContent.footer },
        };
        setContent(mergedContent);
      } catch (e) {
        console.error('Failed to parse landing content:', e);
        setContent(defaultContent);
      }
    }
  }, []);

  const updateContent = (newContent: LandingContent) => {
    setContent(newContent);
    localStorage.setItem('landingContent', JSON.stringify(newContent));
  };

  const resetContent = () => {
    setContent(defaultContent);
    localStorage.removeItem('landingContent');
  };

  return (
    <LandingContentContext.Provider value={{ content, updateContent, resetContent }}>
      {children}
    </LandingContentContext.Provider>
  );
};

export const useLandingContent = () => {
  const context = useContext(LandingContentContext);
  if (!context) {
    throw new Error('useLandingContent must be used within LandingContentProvider');
  }
  return context;
};
