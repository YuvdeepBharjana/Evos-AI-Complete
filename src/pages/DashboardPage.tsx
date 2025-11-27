import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { ChatInterface } from '../components/chat/ChatInterface';
import { FloatingMirrorButton } from '../components/ui/FloatingMirrorButton';

export const DashboardPage = () => {
  const navigate = useNavigate();

  const handleMirrorClick = () => {
    navigate('/mirror');
  };

  return (
    <>
      <Header 
        title="AI Chat" 
        showMirrorButton 
        onMirrorClick={handleMirrorClick}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 overflow-hidden"
      >
        <ChatInterface />
      </motion.div>

      <FloatingMirrorButton />
    </>
  );
};

