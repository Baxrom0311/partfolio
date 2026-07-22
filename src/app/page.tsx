import Navbar   from "@/components/Navbar";
import Hero     from "@/components/Hero";
import About    from "@/components/About";
import Projects from "@/components/Projects";
import Contact  from "@/components/Contact";
import Footer   from "@/components/Footer";
import ClientLayer from "@/components/ClientLayer";

export default function Home() {
  return (
    <>
      <ClientLayer />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
