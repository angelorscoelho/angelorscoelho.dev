import React, { useState, useEffect } from 'react';
import { RESUME } from './constants';
import { ExperienceCard } from './components/ExperienceCard';
import { ProjectCard } from './components/ProjectCard';
import { ChatBot } from './components/ChatBot';
import { CodeBackground } from './components/CodeBackground';
import { SpotlightCard } from './components/SpotlightCard';
import { CertificationCard } from './components/CertificationCard';
import { GitHubIcon, LinkedInIcon, ExternalLinkIcon, EmailIcon, FileTextIcon } from './components/Icon';

function App() {
  const [activeSection, setActiveSection] = useState<string>('about');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'experience', 'projects'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-slate-900 selection:bg-teal-300 selection:text-teal-900 min-h-screen">
      
      <CodeBackground />

      <div className="mx-auto max-w-screen-xl px-6 py-12 font-sans md:px-12 md:py-20 lg:px-24 lg:py-0 relative z-40">
        <div className="lg:flex lg:justify-between lg:gap-12">
          
          {/* LEFT COLUMN: Sidebar */}
          <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-[30%] lg:flex-col lg:justify-between lg:py-24">
            <div>
              <div className="mb-8 block">
                <div className="h-44 w-44 relative overflow-hidden rounded-full border-4 border-slate-800 shadow-2xl group">
                    <img 
                      src="/profile_photo.png" 
                      alt={RESUME.name} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-slate-900/10"></div>
                </div>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-200 sm:text-5xl">
                {RESUME.name}
              </h1>
              <h2 className="mt-3 text-lg font-medium tracking-tight text-slate-200 sm:text-xl">
                {RESUME.title}
              </h2>
              <p className="mt-4 max-w-xs leading-normal text-slate-400">
                {RESUME.tagline}
              </p>
              
              <nav className="nav hidden lg:block" aria-label="In-page jump links">
                <ul className="mt-16 w-max">
                  {['About', 'Experience', 'Projects'].map((item) => (
                    <li key={item}>
                      <button 
                        onClick={() => scrollTo(item.toLowerCase())}
                        className={`group flex items-center py-3 ${activeSection === item.toLowerCase() ? 'active' : ''}`}
                      >
                        <span className={`mr-4 h-px w-8 bg-slate-600 transition-all group-hover:w-16 group-hover:bg-slate-200 ${activeSection === item.toLowerCase() ? '!w-16 !bg-slate-200' : ''}`}></span>
                        <span className={`nav-text text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-200 ${activeSection === item.toLowerCase() ? '!text-slate-200' : ''}`}>
                          {item}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <ul className="ml-1 mt-8 flex items-center" aria-label="Social media and resume">
              <li className="mr-5">
                <a className="block hover:text-teal-300 transition-colors" href="/resume.pdf" target="_blank" rel="noreferrer" title="View Résumé">
                  <span className="sr-only">Résumé</span>
                  <FileTextIcon className="h-6 w-6" />
                </a>
              </li>
              <li className="mr-5">
                <a className="block hover:text-slate-200 transition-colors" href={RESUME.socials.linkedin} target="_blank" rel="noreferrer">
                  <span className="sr-only">LinkedIn</span>
                  <LinkedInIcon className="h-6 w-6" />
                </a>
              </li>
              <li className="mr-5">
                <a className="block hover:text-slate-200 transition-colors" href={RESUME.socials.github} target="_blank" rel="noreferrer">
                  <span className="sr-only">GitHub</span>
                  <GitHubIcon className="h-6 w-6" />
                </a>
              </li>
              <li className="mr-5">
                <a className="block hover:text-slate-200 transition-colors" href={RESUME.socials.email} target="_blank" rel="noreferrer">
                  <span className="sr-only">Email</span>
                  <EmailIcon className="h-6 w-6" />
                </a>
              </li>
            </ul>
          </header>

          {/* RIGHT COLUMN: Content */}
          <main id="content" className="pt-24 lg:w-[60%] lg:py-24">
            
            <section id="about" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
              <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">About</h2>
              </div>
              <SpotlightCard>
                <p className="mb-4">
                 {RESUME.about.split('\n\n')[0]}
                </p>
                <p className="mb-4 leading-relaxed">
                  Driven by a visionary focus on operational excellence, I was chosen as the <span className="font-medium text-teal-300">LEAN Champion</span> on my team to lead the modernization of work routines through custom automation and standardized CI/CD workflows. I am currently specializing in <span className="font-medium text-teal-300">AI Agentic Workflows</span> and proactively exploring <span className="font-medium text-teal-300">AWS Cloud Solutions</span> to architect resilient, future-ready systems.
                </p>
                <p className="leading-relaxed">
                  With a solid history of delivering bespoke Full Stack solutions—from custom UI/UX workflows to high-performance backends—I am now focusing on the intersection of intelligent automation and cloud-native architecture.
                </p>
              </SpotlightCard>
            </section>

            <section id="experience" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
              <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">Experience</h2>
              </div>
              <div>
                <ol className="group/list">
                  {RESUME.experience.map((job, index) => (
                    <li className="mb-12" key={index}>
                      <ExperienceCard job={job} />
                    </li>
                  ))}
                </ol>
                <div className="mt-12">
                  <a className="inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 focus-visible:text-teal-300 group/link text-base font-semibold" href="/resume.pdf" target="_blank" rel="noreferrer">
                    <span>View Full Résumé <span className="inline-block"><ExternalLinkIcon className="ml-1 inline-block h-4 w-4 shrink-0 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1" /></span></span>
                  </a>
                </div>
              </div>
            </section>

            <section id="projects" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
               <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">Projects</h2>
               </div>
               
               <ol className="group/list mb-12">
                 {RESUME.projects.map((project, index) => (
                    <li className="mb-12" key={index}>
                      <ProjectCard project={project} />
                    </li>
                 ))}
               </ol>

               <div className="mb-12">
                <h3 className="mb-4 text-slate-200 font-semibold uppercase tracking-widest text-xs">Current Focus & Learning</h3>
                <ul className="flex flex-wrap gap-2">
                  {RESUME.skills.learning.map((skill, i) => (
                     <li key={i} className="flex items-center rounded-full bg-slate-800 border border-teal-300/30 px-3 py-1 text-xs font-medium leading-5 text-teal-300">
                       {skill}
                     </li>
                  ))}
                </ul>
              </div>

              <div className="mb-12">
                <h3 className="mb-4 text-slate-200 font-semibold uppercase tracking-widest text-xs">Certifications</h3>
                <div className="space-y-4">
                   {RESUME.certifications.map((cert, i) => (
                      <CertificationCard key={i} cert={cert} />
                   ))}
                </div>
              </div>

              <div>
                 <h3 className="mb-4 text-slate-200 font-semibold uppercase tracking-widest text-xs">Core Technologies</h3>
                 <ul className="flex flex-wrap gap-2">
                    {[...RESUME.skills.languages, ...RESUME.skills.frameworks, ...RESUME.skills.devops].slice(0, 25).map((skill, index) => (
                      <li key={index} className="mr-1.5 mt-2">
                        <div className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300 ">
                          {skill}
                        </div>
                      </li>
                    ))}
                  </ul>
              </div>

            </section>

            <footer className="pb-32 text-sm text-slate-500 text-right">
              <p className="leading-relaxed">
                Designed and developed by <span className="font-medium text-slate-200">Ângelo Coelho</span><br />
                <span className="text-xs font-normal">(with the help of some bots 😉)</span>
              </p>
            </footer>
          </main>
        </div>
        <ChatBot />
      </div>
    </div>
  );
}

export default App;