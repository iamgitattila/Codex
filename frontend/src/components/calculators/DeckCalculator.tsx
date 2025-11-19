'use client';

import React, { useState } from 'react';

interface DeckResults {
  squareFeet: number;
  deckBoards: number;
  joists: number;
  posts: number;
  materialCost: number;
  laborCost: number;
  totalCost: number;
}

const DECK_MATERIAL_COSTS = {
  'pressure-treated': {
    name: 'Pressure-Treated Wood',
    boardCost: 2.5, // per sq ft
    structureCost: 3.5, // joists, beams, posts per sq ft
  },
  composite: {
    name: 'Composite Decking',
    boardCost: 8.0,
    structureCost: 3.5,
  },
  cedar: {
    name: 'Cedar Wood',
    boardCost: 5.5,
    structureCost: 4.0,
  },
  pvc: {
    name: 'PVC Decking',
    boardCost: 10.0,
    structureCost: 3.5,
  },
};

export default function DeckCalculator() {
  const [length, setLength] = useState(16);
  const [width, setWidth] = useState(12);
  const [material, setMaterial] = useState<keyof typeof DECK_MATERIAL_COSTS>('pressure-treated');
  const [hasRailing, setHasRailing] = useState(true);
  const [hasStairs, setHasStairs] = useState(true);
  const [results, setResults] = useState<DeckResults | null>(null);

  const calculateDeck = () => {
    const squareFeet = length * width;

    // Material calculations
    const costs = DECK_MATERIAL_COSTS[material];
    const deckingCost = squareFeet * costs.boardCost;
    const structureCost = squareFeet * costs.structureCost;

    // Railing (perimeter)
    const perimeter = 2 * (length + width);
    const railingCost = hasRailing ? perimeter * 35 : 0; // $35/linear ft for railing

    // Stairs
    const stairsCost = hasStairs ? 1500 : 0; // Average stair cost

    const materialCost = deckingCost + structureCost + railingCost + stairsCost;

    // Labor: $15-20 per square foot
    const laborCost = squareFeet * 17;

    const totalCost = materialCost + laborCost;

    // Material counts (simplified)
    const deckBoards = Math.ceil(squareFeet / 15); // ~15 sq ft per 16' board
    const joists = Math.ceil(length / 1.5); // Joists every 16" on center
    const posts = Math.ceil(perimeter / 8); // Posts every 8 feet

    setResults({
      squareFeet,
      deckBoards,
      joists,
      posts,
      materialCost: Math.round(materialCost),
      laborCost: Math.round(laborCost),
      totalCost: Math.round(totalCost),
    });
  };

  return (
    <div className="calculator-widget bg-white rounded-lg shadow-lg p-6 my-8">
      <h3 className="text-2xl font-bold mb-6">🏗️ Deck Cost Calculator</h3>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Length (feet):
            </label>
            <input
              type="number"
              min="8"
              max="40"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">Width (feet):</label>
            <input
              type="number"
              min="8"
              max="40"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Deck Material:</label>
          <select
            value={material}
            onChange={(e) =>
              setMaterial(e.target.value as keyof typeof DECK_MATERIAL_COSTS)
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {Object.entries(DECK_MATERIAL_COSTS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={hasRailing}
              onChange={(e) => setHasRailing(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Include Railing</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={hasStairs}
              onChange={(e) => setHasStairs(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Include Stairs</span>
          </label>
        </div>

        <button
          onClick={calculateDeck}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
        >
          Calculate Deck Cost
        </button>
      </div>

      {results && (
        <div className="results mt-6 border-t pt-6">
          <div className="bg-primary-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Deck Size</div>
              <div className="text-3xl font-bold text-primary-700">
                {results.squareFeet} sq ft
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {length} ft × {width} ft
              </div>
            </div>
          </div>

          <h4 className="text-xl font-bold mb-4">Material Estimate:</h4>

          <table className="w-full mb-6">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-2 text-gray-600">Deck Boards:</td>
                <td className="py-2 text-right font-semibold">~{results.deckBoards}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Joists:</td>
                <td className="py-2 text-right font-semibold">~{results.joists}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Posts:</td>
                <td className="py-2 text-right font-semibold">~{results.posts}</td>
              </tr>
            </tbody>
          </table>

          <div className="cost-summary bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Materials:</span>
              <span className="font-semibold">${results.materialCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Labor (estimated):</span>
              <span className="font-semibold">${results.laborCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-primary-700 pt-2 border-t border-gray-300">
              <span>Total:</span>
              <span>${results.totalCost.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
            <p className="font-semibold mb-1">💡 ROI Insight:</p>
            <p>
              Deck additions typically return 60-80% of cost at resale. A well-maintained deck can
              add significant value to your home.
            </p>
          </div>

          <a
            href="#get-deck-quotes"
            className="block mt-4 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            👷 Get Free Quotes from Deck Builders →
          </a>
        </div>
      )}
    </div>
  );
}
