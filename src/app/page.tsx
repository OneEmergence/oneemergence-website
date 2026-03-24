export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-oe-deep-space text-oe-pure-light px-4 text-center">
      <h1 className="text-5xl md:text-7xl font-serif text-oe-solar-gold mb-6">
        OneEmergence
      </h1>
      <p className="text-xl md:text-2xl max-w-2xl text-oe-spirit-cyan mb-12">
        Eine digitale Heimat, die dich einlädt in eine Erfahrung von Einheit, Freiheit und Liebe.
      </p>
      <div className="flex gap-4">
        <button className="px-6 py-3 rounded-full bg-oe-aurora-violet text-white font-medium hover:opacity-90 transition-opacity">
          Manifesto lesen
        </button>
        <button className="px-6 py-3 rounded-full border border-oe-spirit-cyan text-oe-spirit-cyan hover:bg-oe-spirit-cyan/10 transition-colors">
          Community beitreten
        </button>
      </div>
    </div>
  );
}
