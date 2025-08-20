export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
  diplomas?: string; // Optional field for diplomas or additional documents
}

export interface Experience {
  position: string;
  company: string;
  period: string;
  location?: string;
  description: string[];
  technologies?: string[];
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  location?: string;
  gpa?: string;
  achievements?: string[];
}

export interface SkillCategory {
  title: string;
  skills: string[];
  color?: string;
}

export interface Skills {
  categories: SkillCategory[];
}

export interface Publication {
  title: string;
  authors: string[];
  publication: string;
  date: string;
  doi?: string;
  link?: string;
  description?: string;
}

export interface Competition {
  title: string;
  platform: string;
  url?: string; // Optional URL for the competition
  position: string;
  description?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skills;
  publications: Publication[];
  competitions: Competition[];
  certifications: Certification[];
  languages: Language[];
}
