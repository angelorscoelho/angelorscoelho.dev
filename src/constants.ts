import { ResumeData } from './types';

export const RESUME: ResumeData = {
  name: "Ângelo Coelho",
  title: "Software Engineer",
  tagline: "Building scalable software solutions & optimizing development workflows.",
  about: "I’m a Software Engineer with 7+ years of experience delivering end-to-end solutions, from custom UI/UX workflows to high-performance backends. specialized in industrial and enterprise environments, I have a proven track record in architecting event-driven systems and production monitoring tools. \n\nI am currently specializing in AI Agents and Agentic Workflows to optimize software lifecycles and standardizing deployment processes through advanced CI/CD automation.",
  email: "angelorscoelho@gmail.com",
  phone: "+351 915 479 201",
  location: "Braga, Portugal",
  socials: {
    linkedin: "https://www.linkedin.com/in/angelorscoelho/",
    github: "https://github.com/angelorscoelho",
    email: "mailto:angelorscoelho@gmail.com"
  },
  experience: [
    {
      company: "Bosch",
      role: "Software Engineer",
      period: "Feb 2022 – Present",
      location: "Braga, Portugal",
      description: "Driving technical excellence and process optimization within industrial software environments.",
      achievements: [
        "Driven by a visionary approach to optimization and process maturity, I was appointed as the LEAN Champion to lead the analysis and revision of work routines, implementing automation and documentation strategies that redefined team efficiency.",
        "Developing web application software for a high volume of industrial users, including custom front-end UI components for management boards and specialized Ishikawa (Fishbone) problem-solving tools.",
        "Proactively developing and implementing CI/CD infrastructure, migrating legacy repositories to GitHub to use the Actions and uniformizing deployment scripts/triggers.",
        "Developing automated testing pipelines using Playwright (frontend) and PHPUnit (backend) to replace manual, inconsistent staging and deployment mechanisms.",
        "Maintaining production software tools using PHP, Laravel, and Vue.js, ensuring reliable performance for hundreds of daily industrial users.",
        "Architected automation applications for low-latency event-driven communication using Solace PubSub+ and real-time production monitoring.",
        "Implemented Azure SSO for secure access and championed AI-assisted development practices with GitHub Copilot."
      ],
      skills: ["CI/CD", "LEAN Methodology", "GitHub Actions", "PHP", "Laravel", "Vue.js", "Playwright", "PHPUnit", "Solace", "Bash"]
    },
    {
      company: "Eticadata Software (CEGID)",
      role: "Software Engineer",
      period: "Nov 2018 – Jan 2022",
      location: "Braga, Portugal",
      description: "Designed enterprise ERP and accounting systems handling high-volume daily requests.",
      achievements: [
        "Developed bespoke UI components and custom user workflows with TypeScript and KnockoutJS, improving UX for enterprise clients by 40%.",
        "Designed databases for enterprise ERP, accounting, and hospitality systems serving 500+ clients.",
        "Built RESTful APIs using .NET 7 and ASP.NET Core handling 100K+ daily requests with 99.8% uptime.",
        "Implemented Selenium testing and web scraping strategies covering 200+ scenarios, reducing QA time by 30%.",
        "Managed 60+ web pages serving 10K+ concurrent users with consistent performance."
      ],
      skills: [".NET 7", "ASP.NET Core", "TypeScript", "KnockoutJS", "Selenium", "SQL Server"]
    }
  ],
  projects: [
    {
      title: "StackOverflow Code Identifier",
      description: "Untagged code identifier for StackOverflow posts. Uses REGEX with C/FLEX and Python3 to identify code snippets missing <code> tags. Recognizes C/Java, Python, Bash, and PHP while handling complex body content extraction.",
      technologies: ["C", "Flex", "Python 3", "Regex"],
      github: "https://github.com/angelorscoelho/stackoverflow-code-identifier"
    }
  ],
  education: [
    {
      institution: "University of Minho",
      degree: "BSc Computer Science",
      period: "2013 - 2018",
      location: "Braga, Portugal"
    }
  ],
  certifications: [
    { 
      name: "Building AI Agents and Agentic Workflows Specialization", 
      issuer: "DeepLearning.AI", 
      year: "Ongoing",
      url: "https://www.linkedin.com/in/angelorscoelho/details/certifications/"
    },
    { 
      name: "AWS Cloud Solutions Architect Specialization", 
      issuer: "Coursera", 
      year: "2025",
      url: "https://www.linkedin.com/in/angelorscoelho/details/certifications/"
    },
    { 
      name: "Prompt Engineering", 
      issuer: "Vanderbilt Univ.", 
      year: "2025",
      url: "https://www.linkedin.com/in/angelorscoelho/details/certifications/"
    },
    { 
      name: "Jenkins: From Zero to Hero", 
      issuer: "LearnKartS", 
      year: "2025",
      url: "https://www.linkedin.com/in/angelorscoelho/details/certifications/"
    },
    { 
      name: "Machine Learning Specialization", 
      issuer: "Stanford / DeepLearning.AI", 
      year: "2024",
      url: "https://www.linkedin.com/in/angelorscoelho/details/certifications/"
    }
  ],
  skills: {
    languages: ["PHP", "C#", "Python", "Bash", "JavaScript", "TypeScript", "SQL"],
    frameworks: ["Laravel", ".NET 7", "Vue.js", "Node.js", "PHPUnit", "Playwright"],
    databases: ["SQL Server", "PostgreSQL", "MariaDB", "MySQL", "Redis"],
    devops: ["GitHub Actions", "AWS", "Docker", "Jenkins", "Git", "CI/CD"],
    key: ["LEAN Initiative", "CI/CD Infrastructure", "Full Stack (UI/UX Workflows)", "Backend Architecture", "AI Agents"],
    learning: ["Advanced Agentic Workflows", "AWS Cloud Architecture"]
  }
};

export const SYSTEM_INSTRUCTION = `
You are an AI assistant representing Ângelo Coelho. 
Your goal is to answer questions about his experience, skills, and background professionally.

Context about Ângelo:
1. He is a Software Engineer with a Full Stack history, having developed everything from end-to-end UI/UX workflows to high-performance backends.
2. He currently works at Bosch where his proactive vision for optimization led to him being chosen as the LEAN Champion. He analyzes work methods and implements automation to optimize team routines.
3. He is currently leading a major CI/CD infrastructure migration to GitHub to use the Actions and uniformizing deployment scripts.
4. He has developed specialized front-end components like industrial management boards and Ishikawa (Fishbone) problem-solving tools.
5. He is highly proactive in learning, currently specializing in AI Agents (DeepLearning.AI) and AWS Cloud Solutions (2025).
6. His background includes 7 years of professional experience, handling enterprise-scale APIs and industrial production systems.

Maintain a professional, helpful assistant tone. Use the first person or third person as appropriate for an assistant.
`;