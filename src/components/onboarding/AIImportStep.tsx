import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { DataUploadFlow } from './DataUploadFlow';
import type { IdentityNode } from '../../types';

interface AIImportStepProps {
  onSkip: () => void;
  onImportComplete: (nodes: IdentityNode[]) => void;
}

export const AIImportStep = ({ onSkip, onImportComplete }: AIImportStepProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImportClick = () => {
    setIsModalOpen(true);
  };

  const handleImportComplete = (nodes: IdentityNode[]) => {
    setIsModalOpen(false);
    onImportComplete(nodes);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
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
          <Card>
            <div className="mb-6 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white text-center">
              Want Evos to learn faster?
            </h2>

            <p className="text-sm text-gray-400 mb-8 text-center max-w-xl mx-auto leading-relaxed">
              If you regularly use another AI for journaling or reflection, you can import that data to help Evos recognize deeper patterns. This is optional and can be done later.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleImportClick}
                icon={Sparkles}
                size="lg"
              >
                Import AI-generated data
              </Button>
              <Button
                onClick={onSkip}
                variant="ghost"
                icon={ArrowRight}
                size="lg"
              >
                Skip for now
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modal with DataUploadFlow */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        size="xl"
        title="Import AI Data"
      >
        <div className="max-h-[80vh] overflow-y-auto">
          <DataUploadFlow onComplete={handleImportComplete} />
        </div>
      </Modal>
    </>
  );
};


