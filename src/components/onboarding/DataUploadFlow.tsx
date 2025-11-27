import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { parseChatGPTExport } from '../../lib/parseChatGPTData';
import type { IdentityNode } from '../../types';

interface DataUploadFlowProps {
  onComplete: (nodes: IdentityNode[]) => void;
}

export const DataUploadFlow = ({ onComplete }: DataUploadFlowProps) => {
  const [uploadState, setUploadState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState('');
  const [extractedNodes, setExtractedNodes] = useState<IdentityNode[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setUploadState('processing');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const nodes = parseChatGPTExport(content);
        
        // Simulate processing delay for better UX
        setTimeout(() => {
          setExtractedNodes(nodes);
          setUploadState('success');
        }, 2000);
      } catch (error) {
        console.error('Error processing file:', error);
        setUploadState('error');
      }
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  const handleComplete = () => {
    onComplete(extractedNodes);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-teal-950/20 to-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Import Your AI History</h1>
          <p className="text-gray-400">
            Upload your ChatGPT export or any AI conversation logs
          </p>
        </div>

        <Card>
          {uploadState === 'idle' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={{ y: isDragActive ? -10 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-xl mb-2">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                </p>
                <p className="text-gray-500 mb-4">or click to browse</p>
                <p className="text-sm text-gray-600">Supports: .json, .txt</p>
              </motion.div>
            </div>
          )}

          {uploadState === 'processing' && (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="inline-block mb-4"
              >
                <FileText size={48} className="text-purple-500" />
              </motion.div>
              <p className="text-xl mb-2">Analyzing {fileName}...</p>
              <p className="text-gray-500">Extracting patterns, goals, and traits</p>
              <div className="mt-6 space-y-2 text-left max-w-md mx-auto">
                {['Parsing conversations...', 'Identifying habits...', 'Extracting goals...', 'Building your identity profile...'].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.5 }}
                    className="flex items-center gap-2 text-gray-400"
                  >
                    <CheckCircle size={16} className="text-green-500" />
                    {step}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {uploadState === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
              <h3 className="text-2xl font-bold mb-2">Profile Created!</h3>
              <p className="text-gray-400 mb-6">
                We've extracted {extractedNodes.length} identity nodes from your data
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                {Object.entries(
                  extractedNodes.reduce((acc, node) => {
                    acc[node.type] = (acc[node.type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <div key={type} className="glass rounded-lg p-3">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-400 capitalize">{type}s</div>
                  </div>
                ))}
              </div>

              <Button onClick={handleComplete} size="lg">
                View Your Identity Mirror
              </Button>
            </motion.div>
          )}

          {uploadState === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
              <h3 className="text-2xl font-bold mb-2">Upload Failed</h3>
              <p className="text-gray-400 mb-6">
                We couldn't process your file. Please try again or use the questionnaire.
              </p>
              <Button onClick={() => setUploadState('idle')} variant="secondary">
                Try Again
              </Button>
            </motion.div>
          )}
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 glass rounded-xl p-4 text-sm text-gray-400"
        >
          <p className="font-semibold mb-2">How to export from ChatGPT:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open ChatGPT Settings</li>
            <li>Go to "Data Controls"</li>
            <li>Click "Export data"</li>
            <li>Download and upload the JSON file here</li>
          </ol>
        </motion.div>
      </motion.div>
    </div>
  );
};

