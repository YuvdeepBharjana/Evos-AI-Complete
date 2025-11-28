import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Shield, Lock, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { parseChatGPTExport } from '../../lib/parseChatGPTData';
import type { IdentityNode } from '../../types';

interface DataUploadFlowProps {
  onComplete: (nodes: IdentityNode[]) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const DataUploadFlow = ({ onComplete }: DataUploadFlowProps) => {
  const [uploadState, setUploadState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState('');
  const [extractedNodes, setExtractedNodes] = useState<IdentityNode[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setErrorMessage('File is too large. Maximum size is 50MB.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setErrorMessage('Invalid file type. Please upload a .json or .txt file.');
      } else {
        setErrorMessage('Could not process this file. Please try another.');
      }
      setUploadState('error');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setUploadState('processing');
    setErrorMessage('');

    const reader = new FileReader();
    
    reader.onerror = () => {
      setErrorMessage('Failed to read file. Please try again.');
      setUploadState('error');
    };

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Validate content
        if (!content || content.length < 10) {
          throw new Error('File appears to be empty or too small');
        }

        // Try to parse as JSON first
        let nodes: IdentityNode[];
        try {
          nodes = parseChatGPTExport(content);
        } catch (parseError) {
          throw new Error('Could not extract identity patterns from this file. Please ensure it contains conversation data.');
        }

        if (nodes.length === 0) {
          throw new Error('No identity patterns found. Please try a file with more conversation content.');
        }
        
        // Simulate processing delay for better UX
        setTimeout(() => {
          setExtractedNodes(nodes);
          setUploadState('success');
        }, 2500);
      } catch (error: any) {
        console.error('Error processing file:', error);
        setErrorMessage(error.message || 'Failed to process file. Please try again.');
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
    multiple: false,
    maxSize: MAX_FILE_SIZE
  });

  const handleComplete = () => {
    onComplete(extractedNodes);
  };

  const handleRetry = () => {
    setUploadState('idle');
    setErrorMessage('');
    setFileName('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030014] relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full relative"
      >
        {/* Data Safety Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-green-400 font-medium mb-1">Your data is protected</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-400 text-xs">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Encrypted in transit
                </span>
                <span className="flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete anytime
                </span>
                <span>Never sold or shared</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Import Your AI History
          </h1>
          <p className="text-gray-400">
            Upload your ChatGPT export to instantly build your identity profile
          </p>
        </div>

        <Card>
          {uploadState === 'idle' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-gray-700 hover:border-gray-600 hover:bg-white/[0.02]'
              }`}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={{ y: isDragActive ? -10 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Upload size={48} className={`mx-auto mb-4 ${isDragActive ? 'text-indigo-400' : 'text-gray-400'}`} />
                <p className="text-xl mb-2 text-white">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                </p>
                <p className="text-gray-500 mb-4">or click to browse</p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <span>Supports: .json, .txt</span>
                  <span>•</span>
                  <span>Max: 50MB</span>
                </div>
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
                <FileText size={48} className="text-indigo-400" />
              </motion.div>
              <p className="text-xl mb-2 text-white">Analyzing {fileName}...</p>
              <p className="text-gray-500 mb-6">This may take a moment</p>
              <div className="space-y-3 text-left max-w-md mx-auto">
                {[
                  'Parsing conversations...',
                  'Extracting identity patterns...',
                  'Identifying goals & habits...',
                  'Building your neural map...'
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.6 }}
                    className="flex items-center gap-3 text-gray-400"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.6 + 0.3 }}
                    >
                      <CheckCircle size={18} className="text-green-500" />
                    </motion.div>
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2 text-white">Identity Map Created!</h3>
              <p className="text-gray-400 mb-6">
                We extracted {extractedNodes.length} identity patterns from your data
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 max-w-lg mx-auto">
                {Object.entries(
                  extractedNodes.reduce((acc, node) => {
                    acc[node.type] = (acc[node.type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <motion.div 
                    key={type} 
                    className="bg-white/5 border border-white/10 rounded-xl p-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="text-2xl font-bold text-white">{count}</div>
                    <div className="text-sm text-gray-400 capitalize">{type}s</div>
                  </motion.div>
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
              <h3 className="text-2xl font-bold mb-2 text-white">Upload Failed</h3>
              <p className="text-gray-400 mb-2">
                {errorMessage || "We couldn't process your file."}
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Try again or use the questionnaire instead.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleRetry} variant="secondary">
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <p className="font-semibold text-white mb-3">How to export from ChatGPT:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
            <li>Open ChatGPT → Click your profile</li>
            <li>Go to <span className="text-white">Settings → Data Controls</span></li>
            <li>Click <span className="text-white">"Export data"</span></li>
            <li>Wait for email, download the ZIP, extract the JSON</li>
            <li>Upload the <code className="text-indigo-400 bg-indigo-500/10 px-1 rounded">conversations.json</code> file here</li>
          </ol>
        </motion.div>
      </motion.div>
    </div>
  );
};
