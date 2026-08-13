import Navbar   from "@/components/Navbar";
import Hero     from "@/components/Hero";
import About    from "@/components/About";
import Projects from "@/components/Projects";
import Contact  from "@/components/Contact";
import Footer   from "@/components/Footer";
import ClientLayer from "@/components/ClientLayer";
import Marquee from "@/components/Marquee";

export default function Home() {
  return (
    <>
      <ClientLayer />
      <Navbar />
      <main>
        <Hero />
        <Marquee items={["SHIP REAL THINGS", "FULL-STACK", "IoT ENGINEER", "AI BUILDER", "NEXT.JS", "ESP32", "PYTHON"]} />
        <About />
        <Projects />
        <Marquee dark items={["OPEN TO WORK", "UZBEKISTAN", "50+ REPOS", "10+ HACKATHONS", "@UNI-NAV"]} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
