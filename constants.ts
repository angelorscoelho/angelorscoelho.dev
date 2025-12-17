import { ResumeData } from './types';

export const RESUME: ResumeData = {
  name: "Ângelo Coelho",
  title: "Software Engineer",
  tagline: "Building scalable software solutions & optimizing development workflows.",
  about: "I’m a Backend Software Engineer with 7+ years of experience developing software solutions for industrial and enterprise environments. specialized in high-performance APIs, event-driven architectures, and production monitoring tools. I have a proven ability to deliver measurable business impact through technical excellence and cross-functional collaboration. \n\nI have completed the AWS Cloud Solutions Architect specialization and I am applying cloud-native principles to my projects. I use AI-assisted tools daily to accelerate development and I am currently specializing in AI Agents and Workflows to optimize software lifecycles.",
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
      description: "Developing production software tools for industrial systems.",
      achievements: [
        "Developing and maintaining production software tools for industrial systems using PHP, Laravel, Vue.js, and Solace PubSub+, serving hundreds of daily users.",
        "Spearheading the CI/CD modernization strategy by implementing GitHub Actions for automated deployments and testing (Playwright for frontend, PHPUnit for backend).",
        "Orchestrated the migration of legacy repositories to GitHub, developing custom Bash scripts for automated code transfer and configuring self-hosted runners for production environments.",
        "Built automation applications for low-latency event-driven communication and real-time production monitoring.",
        "Implemented Azure SSO for secure access across multiple production systems.",
        "Led LEAN initiatives, automating workflows and reducing overhead by 20+ hours/month.",
        "Championed AI-assisted development practices using GitHub Copilot, training team members and accelerating feature delivery."
      ],
      skills: ["PHP", "Laravel", "Vue.js", "GitHub Actions", "Bash", "Playwright", "PHPUnit", "Solace"]
    },
    {
      company: "Eticadata Software (CEGID)",
      role: "Software Engineer",
      period: "Nov 2018 – Jan 2022",
      location: "Braga, Portugal",
      description: "Designed enterprise ERP and accounting systems.",
      achievements: [
        "Designed databases for enterprise ERP, accounting, and hospitality systems serving 500+ clients.",
        "Built RESTful APIs using .NET 7 and ASP.NET Core handling 100K+ daily requests with 99.8% uptime.",
        "Developed UI components with TypeScript and KnockoutJS, improving user experience by 40%.",
        "Implemented Selenium testing and web scraping strategies covering 200+ scenarios, reducing QA time by 30%.",
        "Managed 60+ web pages serving 10K+ concurrent users with consistent performance."
      ],
      skills: [".NET 7", "ASP.NET Core", "TypeScript", "KnockoutJS", "Selenium", "SQL Server"]
    }
  ],
  projects: [
    {
      title: "Previous Portfolio",
      description: "My previous personal website showcasing earlier web development projects and experiments.",
      technologies: ["HTML", "CSS", "JavaScript"],
      link: "https://angelorscoelho.github.io/",
      github: "https://github.com/angelorscoelho/angelorscoelho.github.io"
    },
    {
      title: "Industrial KPI Dashboard",
      description: "A real-time dashboard for monitoring production line efficiency, reducing downtime by providing instant alerts to shift managers. (Based on Bosch experience)",
      technologies: ["Vue.js", "Laravel", "WebSockets"],
    },
    {
      title: "ERP API Connector",
      description: "A robust middleware solution connecting legacy accounting software with modern RESTful endpoints, enabling 3rd party integrations. (Based on Eticadata experience)",
      technologies: [".NET Core", "SQL Server", "REST API"],
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
      name: "AWS Cloud Solutions Architect Specialization", 
      issuer: "Coursera", 
      year: "2024",
      url: "https://www.linkedin.com/in/angelorscoelho/details/certifications/"
    },
    { 
      name: "Jenkins: From Zero to Hero", 
      issuer: "LearnKartS", 
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
      name: "ML with Python", 
      issuer: "Coursera", 
      year: "2023",
      url: "https://www.linkedin.com/in/angelorscoelho/details/certifications/"
    }
  ],
  skills: {
    languages: ["PHP", "C#", "Python", "Bash", "JavaScript", "TypeScript", "SQL"],
    frameworks: ["Laravel", ".NET 7", "Vue.js", "Node.js", "PHPUnit", "Playwright"],
    databases: ["SQL Server", "PostgreSQL", "MariaDB", "MySQL", "Redis"],
    devops: ["AWS", "GitHub Actions", "Docker", "Jenkins", "Git", "CI/CD"],
    key: ["REST APIs", "Event-Driven Systems", "Microservices", "Migration Strategies", "AI-Assisted Dev", "LEAN Methodology"],
    learning: ["AI Agents & Workflows", "Advanced Cloud Architecture"]
  }
};

export const SYSTEM_INSTRUCTION = `
You are an AI assistant representing Ângelo Coelho. You are embedded in his portfolio website.
Your goal is to answer questions about his experience, skills, and background professionally and concisely.

Here is Ângelo's Resume Context:
${JSON.stringify(RESUME, null, 2)}

Key behaviors:
1. Speak in the first person (as if you are his digital twin) or third person (as an assistant), but be consistent.
2. Emphasize his solid background in backend engineering (7+ years).
3. Highlight that he has COMPLETED the AWS Cloud Solutions Architect specialization.
4. Highlight that he uses AI tools daily and is currently studying AI Agents.
5. If asked about contact info, provide his email or mention the LinkedIn link.
`;