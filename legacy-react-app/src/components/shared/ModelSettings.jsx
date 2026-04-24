import React, { useState, useEffect } from 'react';
import { AI_CONFIG } from '../../config/ai.config';
import './ModelSettings.css';

export default function ModelSettings({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState(AI_CONFIG.apiKey);
  const [models, setModels] = useState(AI_CONFIG.models);
  const [testStatus, setTestStatus] = useState('idle'); // idle | testing | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const modelOptions = [
    { label: '--- FREE MODELS (₹0) ---', value: '', disabled: true },
    { label: 'Gemma 3 27B', value: 'google/gemma-3-27b-it:free' },
    { label: 'Llama 3.3 70B', value: 'meta-llama/llama-3.3-70b-instruct:free' },
    { label: 'GPT-OSS 20B', value: 'openai/gpt-oss-20b:free' },
    { label: 'Auto free router', value: 'openrouter/free' },
    { label: '--- LOW COST (₹0.01 - ₹0.10) ---', value: '', disabled: true },
    { label: 'Gemini 2.0 Flash Lite', value: 'google/gemini-2.0-flash-lite-001' },
    { label: 'Gemini 2.0 Flash', value: 'google/gemini-2.0-flash' },
    { label: '--- PREMIUM (Best Quality) ---', value: '', disabled: true },
    { label: 'Claude Haiku 3.5', value: 'anthropic/claude-haiku-3.5' },
    { label: 'Claude Sonnet 3.5', value: 'anthropic/claude-sonnet-3.5' },
    { label: 'GPT-4o Mini', value: 'openai/gpt-4o-mini' },
  ];

  const handleSave = () => {
    if (apiKey && !apiKey.startsWith('sk-or-v1-')) {
        if (!window.confirm("This doesn't look like a standard OpenRouter API key (sk-or-v1-...). Save anyway?")) {
            return;
        }
    }

    localStorage.setItem('incubx_openrouter_key', apiKey);
    Object.entries(models).forEach(([key, value]) => {
      localStorage.setItem(`incubx_model_${key}`, value);
    });
    
    // Update AI_CONFIG in memory
    AI_CONFIG.apiKey = apiKey;
    AI_CONFIG.models = { ...models };
    
    onClose();
    window.location.reload(); // Refresh to ensure all services pick up new config
  };

  const testConnection = async () => {
    setTestStatus('testing');
    try {
      const response = await fetch(AI_CONFIG.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': AI_CONFIG.appUrl,
          'X-Title': 'INCUBX Connection Test',
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [{ role: 'user', content: 'Say "ok"' }],
          max_tokens: 10
        }),
      });

      if (response.ok) {
        setTestStatus('success');
      } else {
        const err = await response.json();
        setErrorMessage(err?.error?.message || 'Connection failed');
        setTestStatus('error');
      }
    } catch (err) {
      setErrorMessage(err.message);
      setTestStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="model-settings-overlay" onClick={onClose}>
      <div className="model-settings-panel" onClick={e => e.stopPropagation()}>
        <div className="model-settings-header">
          <div>
            <h2>AI Model Settings</h2>
            <p>Configure OpenRouter and service endpoints</p>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="model-settings-content">
          <div className="settings-section">
            <label>OpenRouter API Key</label>
            <div className="input-with-button">
              <input 
                type="password" 
                className="model-settings-input"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-or-..." 
              />
              <button 
                className={`test-connection-btn ${testStatus}`}
                onClick={testConnection}
                disabled={testStatus === 'testing'}
              >
                {testStatus === 'testing' ? 'Testing...' : 
                 testStatus === 'success' ? '✓ Working' : 
                 testStatus === 'error' ? '× Failed' : 'Test'}
              </button>
            </div>
            <p className="helper-text">Get your free key at openrouter.ai — no credit card needed</p>
            {testStatus === 'error' && <p className="error-text" style={{color: 'red', fontSize: '11px'}}>{errorMessage}</p>}
          </div>

          <div className="settings-section">
            <label>Card Extraction</label>
            <select 
              className="model-settings-select"
              value={models.extraction}
              onChange={e => setModels({...models, extraction: e.target.value})}
            >
              {modelOptions.map(opt => (
                <option key={opt.value + opt.label} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-section">
            <label>Clustering Theme Detection</label>
            <select 
              className="model-settings-select"
                value={models.clustering}
                onChange={e => setModels({...models, clustering: e.target.value})}
            >
              {modelOptions.map(opt => (
                <option key={opt.value + opt.label} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-section">
            <label>Synthesis & Strategies</label>
            <select 
              className="model-settings-select"
              value={models.synthesis}
              onChange={e => setModels({...models, synthesis: e.target.value})}
            >
              {modelOptions.map(opt => (
                <option key={opt.value + opt.label} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="cost-estimator">
            <h4>Estimated Cost</h4>
            <div className="cost-value">
              ₹0.00 <span>/ per 45-min session</span>
            </div>
          </div>
        </div>

        <div className="model-settings-footer">
          <button className="save-btn" onClick={handleSave}>Save Configuration</button>
        </div>
      </div>
    </div>
  );
}
