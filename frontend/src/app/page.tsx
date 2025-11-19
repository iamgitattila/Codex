import FenceCalculator from '@/components/calculators/FenceCalculator';
import DeckCalculator from '@/components/calculators/DeckCalculator';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">🏠 Homeowner.wiki</h1>
          <p className="text-xl text-gray-600">
            Your Local Homeowner Intelligence System
          </p>
          <p className="text-lg text-gray-500 mt-2">
            Permit guides, cost calculators, and maintenance calendars for every city
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Featured Tools</h2>

          <FenceCalculator />
          <DeckCalculator />
        </section>

        <section className="mb-12 bg-blue-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Find Your City</h2>
          <p className="text-gray-700 mb-4">
            Get hyper-local homeowner information for your area:
          </p>
          <ul className="grid grid-cols-2 gap-4">
            <li>✅ Permit requirements & costs</li>
            <li>✅ Zoning regulations</li>
            <li>✅ Seasonal maintenance calendar</li>
            <li>✅ Local contractor costs</li>
            <li>✅ Trash & utility schedules</li>
            <li>✅ Property tax deadlines</li>
          </ul>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4">Popular Cities</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/tx/austin" className="px-4 py-2 bg-primary-100 hover:bg-primary-200 rounded-lg">
              Austin, TX
            </a>
            <a href="/wa/seattle" className="px-4 py-2 bg-primary-100 hover:bg-primary-200 rounded-lg">
              Seattle, WA
            </a>
            <a href="/co/denver" className="px-4 py-2 bg-primary-100 hover:bg-primary-200 rounded-lg">
              Denver, CO
            </a>
            <a href="/or/portland" className="px-4 py-2 bg-primary-100 hover:bg-primary-200 rounded-lg">
              Portland, OR
            </a>
            <a href="/tn/nashville" className="px-4 py-2 bg-primary-100 hover:bg-primary-200 rounded-lg">
              Nashville, TN
            </a>
          </div>
        </section>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2024 Homeowner.wiki - Powered by federal data & local intelligence</p>
        </footer>
      </div>
    </main>
  );
}
