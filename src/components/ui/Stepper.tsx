import { IconComponent } from "@/components/ui/IconSelector";

interface StepperProps {
  /** Current active step (1-indexed) */
  currentStep: number;
  /** Optional labels for each step */
  labels?: string[];
}

export default function Stepper({ currentStep, labels }: StepperProps) {
  return (
    <div className="flex items-center justify-center mb-6">
      {Array.from({ length: (labels || []).length }, (_, i) => {
        const stepNum = i + 1;
        const isActive = currentStep >= stepNum;
        const isCompleted = currentStep > stepNum;

        return (
          <div key={stepNum} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  isActive
                    ? "bg-accent-500 border-accent-500 text-white shadow-lg shadow-accent-500/20"
                    : "border-dark-600 text-dark-400 bg-dark-900"
                }`}
              >
                {isCompleted ? (
                  <IconComponent iconName="Hi/HiCheck" className="w-4 h-4" />
                ) : (
                  String(stepNum)
                )}
              </div>
              {labels && labels[i] && (
                <span className="text-[10px] font-medium text-dark-400 mt-1.5 whitespace-nowrap">
                  {labels[i]}
                </span>
              )}
            </div>

            {/* Connector line */}
            {stepNum < (labels || []).length && (
              <div
                className={`h-0.5 w-12 mx-2 rounded transition-all ${
                  currentStep > stepNum ? "bg-accent-500" : "bg-dark-600"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
