import Link from 'next/link'
import { ChartBarIcon, CpuChipIcon, ShieldCheckIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="relative z-10">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Tradelia</h1>
            </div>
            <div>
              <Link 
                href="/login" 
                className="btn-primary"
              >
                Access Platform
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              AI Applied to 
              <span className="text-blue-400"> Financial Markets</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              We are conducting advanced research on artificial intelligence applications 
              in cryptocurrency markets, developing cutting-edge tools for algorithmic trading 
              and market analysis.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/login" className="btn-primary text-lg px-8 py-3">
                Access Research Platform
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Current Research Focus
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Our first tool is a private cryptocurrency trading engine that combines 
              advanced AI algorithms with real-time market analysis.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <CpuChipIcon className="h-5 w-5 flex-none text-blue-400" />
                  AI-Powered Analysis
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Advanced machine learning algorithms analyze market patterns, 
                    order book dynamics, and funding rates in real-time.
                  </p>
                </dd>
              </div>

              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <ChartBarIcon className="h-5 w-5 flex-none text-blue-400" />
                  Multi-Timeframe Screening
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Sophisticated screeners analyze 15-minute trends while executing 
                    precise entries using 1-minute micro-timing signals.
                  </p>
                </dd>
              </div>

              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <ShieldCheckIcon className="h-5 w-5 flex-none text-blue-400" />
                  Risk Management
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Deterministic risk management with dynamic position sizing, 
                    structural stop losses, and intelligent trailing systems.
                  </p>
                </dd>
              </div>

              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <RocketLaunchIcon className="h-5 w-5 flex-none text-blue-400" />
                  Live Execution
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">
                    Direct integration with Binance Futures for seamless execution 
                    from demo testing to live trading environments.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Private Access Required
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Our cryptocurrency trading tool is currently in private beta. 
              Access is restricted to authorized researchers and partners only.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link 
                href="/login" 
                className="btn-primary text-lg px-8 py-3"
              >
                Login to Platform
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="text-center">
            <p className="text-sm leading-5 text-gray-400">
              © 2024 Tradelia. Advanced AI Research Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}