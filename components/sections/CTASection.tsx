export function CTASection() {
  return (
    <section className="py-24 relative">
      <div className="section-divider mb-24"></div>
      
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-12">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🚀</span>
            </div>
            
            <h2 className="text-4xl font-light text-gradient mb-4">
              Your Crypto Copilot
            </h2>
            <p className="text-xl text-slate-300 mb-2">
              Non trading signals, ma <strong>understanding</strong>
            </p>
            <p className="text-slate-400">
              Make informed decisions, not emotional ones
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">6 Scientific Metrics</h3>
              <p className="text-sm text-slate-400">Evidence-based analysis with academic rigor</p>
            </div>
            
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <div className="text-2xl mb-3">🤖</div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">AI Explanations</h3>
              <p className="text-sm text-slate-400">Ask questions, get contextual answers</p>
            </div>
            
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <div className="text-2xl mb-3">📚</div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">Transparent Methods</h3>
              <p className="text-sm text-slate-400">Full methodology with limitations</p>
            </div>
          </div>

          <div className="space-y-4">
            <button className="btn-primary text-lg px-8 py-4">
              Access Full Dashboard
            </button>
            
            <p className="text-sm text-slate-500">
              Start with free preview • No credit card required
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-700/50">
            <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Live data
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Academic grade
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                AI powered
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}