export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4 text-white">Tradelia</h3>
          <p className="text-sm mb-6">Cost & Execution Friction Analyzer</p>
          <div className="text-xs text-slate-400">
            <p>© 2024 Tradelia. Analisi indipendente dei costi di transazione.</p>
            <p className="mt-2">Non forniamo consigli di investimento.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}