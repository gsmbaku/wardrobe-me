import { useState, useRef } from 'react';
import { downloadBackup, importBackup } from '../services/exportService';
import { useToast } from '../components/common/Toast';
import { Button, Card } from '../components/common';

export default function SettingsPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadBackup();
      showToast('Backup downloaded successfully', 'success');
    } catch (error) {
      showToast('Failed to export backup', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await importBackup(file);
      showToast(
        `Imported ${result.itemCount} items, ${result.outfitCount} outfits, ${result.imageCount} images`,
        'success'
      );
      // Reload the page to refresh all contexts
      window.location.reload();
    } catch (error) {
      showToast('Failed to import backup. Check the file format.', 'error');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <Card padding="lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup & Restore</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Export Data</h3>
            <p className="text-sm text-gray-500 mb-3">
              Download a backup of all your wardrobe data including items, outfits, wear logs, and images.
            </p>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Download Backup'}
            </Button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Import Data</h3>
            <p className="text-sm text-gray-500 mb-3">
              Restore from a backup file. This will replace all existing data.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? 'Importing...' : 'Import Backup'}
            </Button>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
        <p className="text-sm text-gray-600">
          My Wardrobe is a local-first app for managing your clothing. All your data is stored
          locally on your device and never sent to any server.
        </p>
      </Card>
    </div>
  );
}
