export function ProblemSection() {
  return (
    <section className="py-24 relative">
      <div className="section-divider mb-24"></div>
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gradient mb-6">
            Tired of Crypto Noise?
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Signal vs Noise Problem
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card-premium text-center group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 flex items-center justify-center group-hover:border-red-500/30 transition-colors">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-medium text-slate-200 mb-4">Twitter Hype vs Real Analysis</h3>
            <p className="text-slate-400 leading-relaxed">
              Influencer opinions flood out data-driven insights
            </p>
          </div>

          <div className="card-premium text-center group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 flex items-center justify-center group-hover:border-orange-500/30 transition-colors">
              <span className="text-2xl">😨</span>
            </div>
            <h3 className="text-xl font-medium text-slate-200 mb-4">Emotional Decisions vs Informed Choices</h3>
            <p className="text-slate-400 leading-relaxed">
              FOMO and fear drive trades instead of market context
            </p>
          </div>

          <div className="card-premium text-center group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 flex items-center justify-center group-hover:border-yellow-500/30 transition-colors">
              <span className="text-2xl">❓</span>
            </div>
            <h3 className="text-xl font-medium text-slate-200 mb-4">Everyone tells you WHAT, nobody explains WHY</h3>
            <p className="text-slate-400 leading-relaxed">
              Price movements without context or scientific reasoning
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}