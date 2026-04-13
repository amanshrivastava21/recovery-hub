import awarenessImg from "@/assets/awareness.jpg";

const Awareness = () => (
  <section className="py-20 px-4">
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
      <div className="rounded-2xl overflow-hidden shadow-elevated">
        <img
          src={awarenessImg}
          alt="Say no to drugs awareness"
          width={800}
          height={600}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Say No to Drugs
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Drug addiction is a growing crisis that destroys families and communities.
          At Jeevan Sudhar NGO, we believe every individual deserves a chance at recovery.
          Our team of dedicated professionals provides compassionate care, evidence-based
          treatment, and the support needed to overcome addiction.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Together, we can break the cycle of substance abuse and help people
          rediscover their potential. Your support can change — and save — lives.
        </p>
      </div>
    </div>
  </section>
);

export default Awareness;
