import { useStats } from '../hooks/useStats';
import { Card } from '../components/common';
import MostWornChart from '../components/stats/MostWornChart';
import CategoryBreakdown from '../components/stats/CategoryBreakdown';
import NeverWornList from '../components/stats/NeverWornList';

export default function StatsPage() {
  const stats = useStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Wardrobe Statistics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{stats.totalItems}</p>
            <p className="text-sm text-gray-500">Total Items</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{stats.totalOutfits}</p>
            <p className="text-sm text-gray-500">Outfits</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{stats.totalWears}</p>
            <p className="text-sm text-gray-500">Total Wears</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{stats.neverWornCount}</p>
            <p className="text-sm text-gray-500">Never Worn</p>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Worn Items</h2>
          <MostWornChart items={stats.mostWorn} />
        </Card>

        <Card padding="lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Items by Category</h2>
          <CategoryBreakdown breakdown={stats.categoryBreakdown} />
        </Card>
      </div>

      <Card padding="lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Never Worn Items</h2>
        <NeverWornList items={stats.neverWorn} />
      </Card>
    </div>
  );
}
