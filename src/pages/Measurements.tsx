import MeasurementForm from '../components/MeasurementForm';
import { usePageTitle } from '../lib/usePublic';
export default function Measurements() {
  usePageTitle('Measurements', 'Share your measurements with Seema Boutique for made-to-measure outfits.');
  return <div className="mx-auto max-w-3xl px-4 py-10"><h1 className="mb-6 text-5xl text-plum">Share your measurements</h1><MeasurementForm /></div>;
}
