import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface PersonalContextData {
  gender: string;
  height_feet?: number;
  height_inches?: number;
  weight?: number;
}

interface PersonalContextStepProps {
  onComplete: (data: PersonalContextData) => void;
}

const personalContextFields = [
  {
    id: 'gender',
    label: 'Gender',
    type: 'select' as const,
    required: true,
    description: 'This helps Evos personalize your experience and recommendations.',
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Non-binary', value: 'non_binary' },
      { label: 'Prefer not to say', value: 'prefer_not_to_say' },
    ],
  },
  {
    id: 'height_feet',
    label: 'Height (feet)',
    type: 'number' as const,
    required: false,
    description: 'Optional: Used for health and fitness tracking.',
    min: 3,
    max: 8,
  },
  {
    id: 'height_inches',
    label: 'Height (inches)',
    type: 'number' as const,
    required: false,
    description: 'Optional: Used for health and fitness tracking.',
    min: 0,
    max: 11,
  },
  {
    id: 'weight',
    label: 'Weight (lbs)',
    type: 'number' as const,
    required: false,
    description: 'Optional: Used for health and fitness tracking.',
    min: 50,
    max: 500,
  },
];

export const PersonalContextStep = ({ onComplete }: PersonalContextStepProps) => {
  const [formData, setFormData] = useState<PersonalContextData>({
    gender: '',
    height_feet: undefined,
    height_inches: undefined,
    weight: undefined,
  });
  const [error, setError] = useState<string | null>(null);

  const handleFieldChange = (fieldId: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value === '' ? undefined : value,
    }));
    setError(null);
  };

  const handleSubmit = () => {
    if (!formData.gender) {
      setError('Please select your gender to continue.');
      return;
    }

    onComplete(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030014] relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-indigo-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl w-full relative"
      >
        {/* Data Safety Notice */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
        >
          <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-300">
            Your personal information is encrypted and never shared. You can update or delete this data anytime.
          </p>
        </motion.div>

        <Card>
          <div className="mb-2 text-sm text-indigo-400 font-medium">
            Personal Context
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
            Tell us about yourself
          </h2>

          <p className="text-sm text-gray-400 mb-8 max-w-2xl leading-relaxed">
            This information helps Evos personalize your experience and provide more relevant recommendations.
          </p>

          <div className="space-y-6">
            {personalContextFields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                <p className="text-xs text-gray-500 mb-3">{field.description}</p>
                
                {field.type === 'select' ? (
                  <select
                    value={formData[field.id as keyof PersonalContextData] as string || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="">Select {field.label.toLowerCase()}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={formData[field.id as keyof PersonalContextData] as number || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : Number(e.target.value);
                      handleFieldChange(field.id, value);
                    }}
                    min={field.min}
                    max={field.max}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="flex justify-end mt-8">
            <Button
              onClick={handleSubmit}
              icon={ArrowRight}
              disabled={!formData.gender}
            >
              Continue
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

