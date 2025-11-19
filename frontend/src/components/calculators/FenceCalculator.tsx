'use client';

import React, { useState } from 'react';

interface FenceCosts {
  post: number;
  rail: number;
  picket: number;
}

interface CalculationResults {
  posts: number;
  rails: number;
  pickets: number;
  materialCost: number;
  laborCost: number;
  totalCost: number;
}

const FENCE_COSTS: Record<string, FenceCosts> = {
  wood: { post: 8, rail: 3, picket: 1.5 },
  vinyl: { post: 25, rail: 8, picket: 4 },
  composite: { post: 20, rail: 6, picket: 3.5 },
  metal: { post: 15, rail: 5, picket: 2 },
};

export default function FenceCalculator() {
  const [linearFt, setLinearFt] = useState(100);
  const [corners, setCorners] = useState(4);
  const [gates, setGates] = useState(1);
  const [fenceType, setFenceType] = useState<keyof typeof FENCE_COSTS>('wood');
  const [results, setResults] = useState<CalculationResults | null>(null);

  const calculateFence = () => {
    // Standard spacing: posts every 6 feet
    const numPosts = Math.ceil(linearFt / 6) + corners + gates * 2;
    const numRails = (linearFt / 6) * 2; // 2 rails per section
    const numPickets = linearFt * (12 / 5); // 5 inch pickets with spacing

    const costs = FENCE_COSTS[fenceType];
    const materialCost = numPosts * costs.post + numRails * costs.rail + numPickets * costs.picket;

    const laborCost = linearFt * 25; // $25/ft for labor
    const totalCost = materialCost + laborCost;

    setResults({
      posts: Math.round(numPosts),
      rails: Math.round(numRails),
      pickets: Math.round(numPickets),
      materialCost: Math.round(materialCost),
      laborCost: Math.round(laborCost),
      totalCost: Math.round(totalCost),
    });
  };

  return (
    <div className="calculator-widget bg-white rounded-lg shadow-lg p-6 my-8">
      <h3 className="text-2xl font-bold mb-6">🪵 Fence Cost Calculator</h3>

      <div className="space-y-6">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Linear Footage: <span className="text-primary-600 font-bold">{linearFt} ft</span>
          </label>
          <input
            type="range"
            min="20"
            max="500"
            value={linearFt}
            onChange={(e) => setLinearFt(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>20 ft</span>
            <span>500 ft</span>
          </div>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Corners:
          </label>
          <input
            type="number"
            min="0"
            max="20"
            value={corners}
            onChange={(e) => setCorners(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Gates:
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={gates}
            onChange={(e) => setGates(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fence Type:</label>
          <select
            value={fenceType}
            onChange={(e) => setFenceType(e.target.value as keyof typeof FENCE_COSTS)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="wood">Wood (Budget-Friendly)</option>
            <option value="composite">Composite (Durable)</option>
            <option value="vinyl">Vinyl (Low-Maintenance)</option>
            <option value="metal">Metal (Modern)</option>
          </select>
        </div>

        <button
          onClick={calculateFence}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
        >
          Calculate Cost
        </button>
      </div>

      {results && (
        <div className="results mt-6 border-t pt-6">
          <h4 className="text-xl font-bold mb-4">Your Material List:</h4>

          <table className="w-full mb-6">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-2 text-gray-600">Posts:</td>
                <td className="py-2 text-right font-semibold">{results.posts}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Rails:</td>
                <td className="py-2 text-right font-semibold">{results.rails}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Pickets/Panels:</td>
                <td className="py-2 text-right font-semibold">{results.pickets}</td>
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

          <a
            href={`#affiliate-shop?materials=fence&type=${fenceType}`}
            className="block mt-4 text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            🛒 Shop Materials at Home Depot →
          </a>

          <a
            href="#get-quotes"
            className="block mt-2 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            👷 Get Free Quotes from Local Contractors →
          </a>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        <p>
          * Costs are estimates based on national averages. Actual costs may vary based on your
          location, material quality, and contractor rates. Always get multiple quotes.
        </p>
      </div>
    </div>
  );
}
