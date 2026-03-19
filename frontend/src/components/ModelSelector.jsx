import { useState, useEffect } from "react";

const AVAILABLE_MODELS = [
  { id: "llama", name: "LLaMA 3.3 70B", provider: "Groq" },
  { id: "compound", name: "Compound Beta", provider: "Groq" },
  { id: "gemini", name: "Gemini 1.5 Pro", provider: "Google" },
  { id: "gpt4", name: "GPT-4", provider: "OpenAI" },
];

export default function ModelSelector({ selectedModels, onSelectionChange }) {
  const [localSelected, setLocalSelected] = useState(selectedModels || []);

  useEffect(() => {
    setLocalSelected(selectedModels || []);
  }, [selectedModels]);

  const handleModelToggle = (modelId) => {
    let newSelected;
    if (localSelected.includes(modelId)) {
      newSelected = localSelected.filter(id => id !== modelId);
    } else {
      if (localSelected.length >= 3) return; // Max 3 models
      newSelected = [...localSelected, modelId];
    }
    setLocalSelected(newSelected);
    onSelectionChange(newSelected);
  };

  return (
    <div className="model-selector">
      <div className="model-selector-header">
        <h3>Select Council Models</h3>
        <p>Choose 2-3 models to participate in the council (max 3)</p>
      </div>
      
      <div className="model-grid">
        {AVAILABLE_MODELS.map((model) => (
          <div
            key={model.id}
            className={`model-card ${localSelected.includes(model.id) ? 'selected' : ''}`}
            onClick={() => handleModelToggle(model.id)}
          >
            <div className="model-name">{model.name}</div>
            <div className="model-provider">{model.provider}</div>
            <div className="model-checkbox">
              {localSelected.includes(model.id) && <span>✓</span>}
            </div>
          </div>
        ))}
      </div>
      
      <div className="selection-count">
        Selected: {localSelected.length}/3 models
      </div>
    </div>
  );
}