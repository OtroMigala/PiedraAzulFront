import React from 'react';
import { Check } from 'lucide-react';
import { COLORS } from '../data/mockData';

interface ProgressStepsProps {
  steps: string[];
  current: number;
}

export function ProgressSteps({ steps, current }: ProgressStepsProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < current;
        const isActive = stepNum === current;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0"
                style={{
                  background: isCompleted ? COLORS.green : isActive ? COLORS.blue : COLORS.grayLight,
                  color: isCompleted || isActive ? 'white' : COLORS.gray,
                  border: isActive ? `2px solid ${COLORS.blue}` : 'none',
                }}
              >
                {isCompleted ? (
                  <Check size={16} />
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{stepNum}</span>
                )}
              </div>
              <span
                className="text-center hidden sm:block"
                style={{
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? COLORS.blue : isCompleted ? COLORS.green : COLORS.gray,
                  maxWidth: 72,
                  lineHeight: 1.2,
                }}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-1 mb-4 transition-all duration-300"
                style={{
                  background: isCompleted ? COLORS.green : COLORS.grayLight,
                  minWidth: 20,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
