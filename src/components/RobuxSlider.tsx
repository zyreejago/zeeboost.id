'use client';

import { useState, useEffect } from 'react';

interface RobuxSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function RobuxSlider({ 
  value, 
  onChange, 
  min = 100, 
  max = 10000, 
  step = 100 
}: RobuxSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min;
    const clampedValue = Math.max(min, Math.min(max, newValue));
    setLocalValue(clampedValue);
    onChange(clampedValue);
  };
  
  const quickAmounts = [100, 500, 1000, 2500, 5000, 10000];
  
  return (
    <div className="space-y-6">
      {/* Quick Select */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Pilihan Cepat
        </label>
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => onChange(amount)}
              className={`p-3 rounded-lg border-2 transition-all font-medium ${
                localValue === amount
                  ? 'border-primary bg-primary text-white'
                  : 'border-border hover:border-primary-300 bg-background'
              }`}
            >
              {amount.toLocaleString()} R$
            </button>
          ))}
        </div>
      </div>
      
      {/* Slider */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Atau Pilih Manual
        </label>
        <div className="space-y-4">
          <div className="relative">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={localValue}
              onChange={handleSliderChange}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{min.toLocaleString()} R$</span>
              <span>{max.toLocaleString()} R$</span>
            </div>
          </div>
          
          {/* Input Manual */}
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={localValue}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Masukkan jumlah Robux"
            />
            <span className="text-sm font-medium text-muted-foreground">Robux</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .slider {
          background: linear-gradient(to right, 
            var(--primary) 0%, 
            var(--primary) ${((localValue - min) / (max - min)) * 100}%, 
            #e5e7eb ${((localValue - min) / (max - min)) * 100}%, 
            #e5e7eb 100%);
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          border: 3px solid white;
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-track {
          background: linear-gradient(to right, 
            var(--primary) 0%, 
            var(--primary) ${((localValue - min) / (max - min)) * 100}%, 
            #e5e7eb ${((localValue - min) / (max - min)) * 100}%, 
            #e5e7eb 100%);
          height: 8px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}