import { useEffect } from 'react';
import { Map } from './components/Map';
import { Sidebar } from './components/Sidebar';
import { ReportForm } from './components/ReportForm';
import { FilterPanel } from './components/FilterPanel';
import { useAppStore } from './store/appStore';

function App() {
  const { fetchIncidents } = useAppStore();

  // Fetch incidents on mount
  useEffect(() => {
    fetchIncidents();

    // Refresh every 5 minutes
    const interval = setInterval(fetchIncidents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 relative">
        <Map />
      </div>
      <ReportForm />
      <FilterPanel />
    </div>
  );
}

export default App;
