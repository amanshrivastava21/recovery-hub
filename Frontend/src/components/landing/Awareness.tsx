import { useLandingContent } from "@/contexts/LandingContentContext";

const Awareness = () => {
  const { content } = useLandingContent();
  
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="rounded-2xl overflow-hidden shadow-elevated">
          <img
            src={content.awareness.image}
            alt="Say no to alcohol awareness"
            width={800}
            height={600}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content.awareness.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {content.awareness.description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Awareness;
