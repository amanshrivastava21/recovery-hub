import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLandingContent } from "@/contexts/LandingContentContext";

const Hero = () => {
  const { content } = useLandingContent();
  const [current, setCurrent] = useState(0);
  const slides = content.hero.images;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-[90vh] min-h-[500px] overflow-hidden">
      {slides.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Rehabilitation slide ${i + 1}`}
          width={1920}
          height={800}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-foreground/60" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-4 max-w-4xl leading-tight">
          {content.hero.title}
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl">
          {content.hero.subtitle}
        </p>
        <Button size="lg" onClick={scrollToContact} className="text-base px-8">
          {content.hero.buttonText}
        </Button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === current ? "w-8 bg-primary" : "w-2.5 bg-primary-foreground/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
