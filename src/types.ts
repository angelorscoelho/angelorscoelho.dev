export interface Job {
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  achievements: string[];
  skills: string[];
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  location: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
  url?: string;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  image?: string;
}

export interface ResumeData {
  name: string;
  title: string;
  tagline: string;
  about: string;
  email: string;
  phone: string;
  location: string;
  socials: {
    linkedin: string;
    email: string;
    github: string;
  };
  experience: Job[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  skills: {
    languages: string[];
    frameworks: string[];
    databases: string[];
    devops: string[];
    key: string[];
    learning: string[]; // Areas of current focus (AI, AWS)
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}