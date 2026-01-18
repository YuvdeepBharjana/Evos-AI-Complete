import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { NodeBadge } from '../components/work/NodeBadge';
import { NodeChatInterface } from '../components/work/NodeChatInterface';
import { DailyActionsPanel } from '../components/work/DailyActionsPanel';

export const WorkEnvironmentPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();

  // Find the node
  const node = user?.identityNodes?.find(n => n.id === nodeId);

  if (!node) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Node not found</p>
          <button
            onClick={() => navigate('/mirror')}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors"
          >
            Back to Mirror
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/mirror')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <ArrowLeft size={20} className="text-gray-400 group-hover:text-white" />
          </button>
          <NodeBadge
            nodeName={node.label}
            nodeType={node.type}
            strength={node.strength}
          />
        </div>
        <div className="text-sm text-gray-500">
          Work Environment
        </div>
      </motion.div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Chat (60%) */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-[3] border-r border-gray-800"
        >
          <NodeChatInterface node={node} />
        </motion.div>

        {/* Right Side - Daily Actions (40%) */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-[2]"
        >
          <DailyActionsPanel currentNodeId={node.id} />
        </motion.div>
      </div>
    </div>
  );
};
