import { ResumeData } from './types';

export const RESUME: ResumeData = {
  name: "Ângelo Coelho",
  title: "Software Engineer",
  tagline: "Building scalable software solutions & optimizing development workflows.",
  about: "Software Engineer with 7+ years of experience delivering end-to-end solutions, from complex UI/UX workflows to high-availability backends. I focus on the entire delivery lifecycle, proactively identifying bottlenecks and implementing architectural improvements. My approach combines rigorous engineering with advanced AI-assisted workflows to maximize velocity and code quality without compromising stability.",
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
      description: "Driving technical excellence and process optimization within enterprise software teams.",
      achievements: [
        "Discussed requirements, architected solutions and implemented new tools and integrations (PHP, Laravel, Vue.js), including event-driven integrations (Solace PubSub+) and Azure SSO to modernize operational tooling.",
        "Engineered the department's transition to automated delivery, replacing manual staging with standardized CI/CD pipelines (GitHub Actions) and comprehensive testing suites (Playwright, PHPUnit).",
        "Championed operational efficiency by integrating advanced AI workflows—leveraging MCP servers and context-aware model orchestration for planning, debugging, and documentation—significantly reducing development friction."
      ],
      skills: ["CI/CD", "GitHub Actions", "PHP", "Laravel", "Vue.js", "Playwright", "PHPUnit", "Solace", "AI Orchestration"]
    },
    {
      company: "Eticadata Software (CEGID)",
      role: "Software Engineer",
      period: "Nov 2018 – Jan 2022",
      location: "Braga, Portugal",
      description: "Worked on enterprise ERP, accounting and hospitality systems serving a broad customer base.",
      achievements: [
        "Managed the full lifecycle of multiple product modules (Accounting, Hotels, Billing), ensuring consistent performance for thousands of active clients.",
        "Designed and evolved database schemas and RESTful APIs using .NET and ASP.NET Core, supporting high-traffic daily operations.",
        "Developed bespoke UI components and user workflows using TypeScript, KnockoutJS, and jQuery—balancing the migration of legacy code with the delivery of new market-facing features.",
        "Implemented Selenium-based automated testing and web scraping strategies, covering dozens of critical user scenarios to validate system integrity.",
        "Optimized existing SQL queries and backend logic to handle increasing data loads across the ERP suite."
      ],
      skills: ["ASP.NET Core", ".NET", "C#", "TypeScript", "KnockoutJS", "jQuery", "Selenium", "NUnit", "SQL Server"]
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
    frameworks: ["Laravel", ".NET", "Vue.js", "Node.js", "PHPUnit", "Playwright", "KnockoutJS", "jQuery", "NUnit", "xUnit"],
    databases: ["SQL Server", "PostgreSQL", "MariaDB", "MySQL", "Redis"],
    devops: ["GitHub Actions", "AWS", "Docker", "Jenkins", "Git", "CI/CD"],
    key: ["Process improvements", "CI/CD Infrastructure", "Full Stack (UI/UX Workflows)", "Backend Architecture", "AI-assisted development"],
    learning: ["Advanced Agentic Workflows", "Model Context Protocol (MCP)", "LLM Orchestration"]
  }
};

export const SYSTEM_INSTRUCTION = `
You are an AI assistant representing Ângelo Coelho.
Your goal is to answer questions about his experience, skills, and background professionally.

Context about Ângelo:
1. He is a Software Engineer with a Full Stack history, having developed everything from end-to-end UI/UX workflows to high-performance backends.
2. He leads process and automation improvements, including advocating and implementing CI/CD migrations and deployment automation to improve team workflows.
3. He has developed specialized front-end components and operational tooling for production users.
4. He is proactive in learning, currently exploring AI-assisted development tools (MCP, Agentic Workflows) and AWS Cloud solutions.
5. His background includes 7 years of professional experience building enterprise-scale APIs and production software.

Maintain a professional, helpful assistant tone. Use the first person or third person as appropriate for an assistant.
`;