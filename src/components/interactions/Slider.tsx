/**
 * 📊 Slider Component
 *
 * Spectrum slider for voice/personality settings.
 * Shows a labeled scale with draggable thumb.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SliderSetInteraction, SliderConfig } from '@/lib/types';

// ============================================
// 📦 Props
// ============================================

interface SliderSetProps {
  interaction: SliderSetInteraction;
  onSubmit: (values: Record<string, number>) => void;
  isSubmitting?: boolean;
}

// ============================================
// 🎨 Component
// ============================================

export function SliderSet({ interaction, onSubmit, isSubmitting }: SliderSetProps) {
  const { prompt, sliders } = interaction;

  // Initialize values with defaults
  const [values, setValues] = useState<Record<string, number>>(
    sliders.reduce((acc, slider) => {
      acc[slider.id] = slider.defaultValue;
      return acc;
    }, {} as Record<string, number>)
  );

  /**
   * Update a slider value.
   */
  const updateValue = (sliderId: string, value: number) => {
    setValues((prev) => ({
      ...prev,
      [sliderId]: value,
    }));
  };

  /**
   * Handle submit.
   */
  const handleSubmit = () => {
    if (!isSubmitting) {
      onSubmit(values);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-slide-up">
      {/* Prompt */}
      <p className="text-gray-800 font-medium mb-6">{prompt}</p>

      {/* Sliders */}
      <div className="space-y-6">
        {sliders.map((slider) => (
          <SingleSlider
            key={slider.id}
            config={slider}
            value={values[slider.id]}
            onChange={(v) => updateValue(slider.id, v)}
          />
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all',
            'bg-primary-600 text-white hover:bg-primary-700 active:scale-95',
            isSubmitting && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <>Processing...</>
          ) : (
            <>
              Continue
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================
// 📏 Single Slider
// ============================================

interface SingleSliderProps {
  config: SliderConfig;
  value: number;
  onChange: (value: number) => void;
}

function SingleSlider({ config, value, onChange }: SingleSliderProps) {
  const { labelLow, labelHigh, min, max, step } = config;

  // Calculate percentage for visual positioning
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      {/* Labels */}
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>{labelLow}</span>
        <span className="font-medium text-primary-600">{value}</span>
        <span>{labelHigh}</span>
      </div>

      {/* Slider Track */}
      <div className="relative h-2 bg-gray-100 rounded-full">
        {/* Filled portion */}
        <motion.div
          className="absolute h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
          style={{ width: `${percent}%` }}
          layout
        />

        {/* Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
            'appearance-none'
          )}
        />

        {/* Thumb (visual) */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-primary-500 rounded-full shadow-md"
          style={{ left: `calc(${percent}% - 10px)` }}
          layout
        />
      </div>

      {/* Tick marks */}
      <div className="flex justify-between mt-1 px-0.5">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((tick) => (
          <div
            key={tick}
            className={cn(
              'w-0.5 h-1 rounded-full',
              tick === value ? 'bg-primary-500' : 'bg-gray-200'
            )}
          />
        ))}
      </div>
    </div>
  );
}
