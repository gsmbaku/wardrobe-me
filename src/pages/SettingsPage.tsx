import { useState, useRef } from 'react';
import { downloadBackup, importBackup } from '../services/exportService';
import { clearAIConfig, getAIConfig, saveAIConfig } from '../services/aiService';
import { useToast } from '../components/common/Toast';
import { Button, Card } from '../components/common';
import { DEFAULT_AI_CONFIG } from '../utils/constants';

export default function SettingsPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [aiBaseUrl, setAiBaseUrl] = useState(() => getAIConfig().baseUrl);
  const [aiApiKey, setAiApiKey] = useState(() => getAIConfig().apiKey);
  const [aiModel, setAiModel] = useState(() => getAIConfig().model);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadBackup();
      showToast('Backup downloaded successfully', 'success');
    } catch {
      showToast('Failed to export backup', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    const confirmed = window.confirm(
      'Importing a backup will replace all your local wardrobe data (items, outfits, wear logs, events, notes, storage spaces, AI conversations, and images). Continue?'
    );
    if (confirmed) {
      fileInputRef.current?.click();
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await importBackup(file);
      showToast(
        `Imported ${result.itemCount} items, ${result.outfitCount} outfits, ${result.wearLogCount} wear logs, ${result.noteCount} notes, ${result.storageSpaceCount} storage spaces, ${result.eventCount} events, ${result.conversationCount} conversations, ${result.imageCount} images`,
        'success'
      );
      window.location.reload();
    } catch {
      showToast('Failed to import backup. Check the file format.', 'error');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveAIConfig = () => {
    if (!aiBaseUrl.trim() || !aiModel.trim()) {
      showToast('Please enter a base URL and model', 'error');
      return;
    }

    saveAIConfig({
      baseUrl: aiBaseUrl,
      apiKey: aiApiKey,
      model: aiModel,
    });
    showToast('AI settings saved', 'success');
  };

  const handleUseGroqDefaults = () => {
    setAiBaseUrl(DEFAULT_AI_CONFIG.baseUrl);
    setAiModel(DEFAULT_AI_CONFIG.model);
    showToast('Groq defaults filled in. Paste your API key and save.', 'success');
  };

  const handleClearAIConfig = () => {
    clearAIConfig();
    const defaults = getAIConfig();
    setAiBaseUrl(defaults.baseUrl);
    setAiApiKey(defaults.apiKey);
    setAiModel(defaults.model);
    showToast('AI settings cleared', 'success');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <Card padding="lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Settings</h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Configure the model used by Dress Me and the AI Assistant. These settings are stored
            locally in this browser. Groq is the recommended free/cheap testing option; the default
            URL uses the dev server proxy to avoid browser CORS during testing.
          </p>

          <div>
            <label htmlFor="ai-base-url" className="block text-sm font-medium text-gray-700 mb-1">
              Base URL
            </label>
            <input
              id="ai-base-url"
              type="url"
              value={aiBaseUrl}
              onChange={(e) => setAiBaseUrl(e.target.value)}
              placeholder="/api/groq/openai/v1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="ai-model" className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <input
              id="ai-model"
              type="text"
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              placeholder="llama-3.3-70b-versatile"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="ai-api-key" className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              id="ai-api-key"
              type="password"
              value={aiApiKey}
              onChange={(e) => setAiApiKey(e.target.value)}
              placeholder="gsk_..."
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              This key is saved in localStorage. Use a free or low-limit key for tunnel testing.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSaveAIConfig}>Save AI Settings</Button>
            <Button variant="outline" onClick={handleUseGroqDefaults}>
              Use Groq Defaults
            </Button>
            <Button variant="ghost" onClick={handleClearAIConfig}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup & Restore</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Export Data</h3>
            <p className="text-sm text-gray-500 mb-3">
              Download a backup of all your wardrobe data including items, outfits, wear logs,
              events, notes, storage spaces, AI conversations, and images.
            </p>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Download Backup'}
            </Button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Import Data</h3>
            <p className="text-sm text-gray-500 mb-3">
              Restore from a backup file. This will replace all existing local data.
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
              onClick={handleImportClick}
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
