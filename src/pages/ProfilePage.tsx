import { motion } from 'framer-motion';
import { User, Calendar, TrendingUp, Award } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { useUserStore } from '../store/useUserStore';

export const ProfilePage = () => {
  const { user } = useUserStore();

  if (!user) return null;

  const stats = [
    {
      icon: TrendingUp,
      label: 'Identity Nodes',
      value: user.identityNodes.length,
      color: 'from-purple-500 to-blue-500'
    },
    {
      icon: Award,
      label: 'Mastered Traits',
      value: user.identityNodes.filter(n => n.status === 'mastered').length,
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: User,
      label: 'Active Goals',
      value: user.identityNodes.filter(n => n.type === 'goal' && n.status === 'active').length,
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  return (
    <>
      <Header title="Profile" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 overflow-y-auto p-8"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <Card>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 flex items-center justify-center text-4xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={16} />
                  <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300">
                    ✓ Onboarding Complete
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                      <Icon size={24} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Identity Breakdown */}
          <Card>
            <h3 className="text-xl font-bold mb-6">Identity Breakdown</h3>
            <div className="space-y-4">
              {['habit', 'goal', 'trait', 'emotion', 'struggle'].map((type) => {
                const count = user.identityNodes.filter(n => n.type === type).length;
                const percentage = user.identityNodes.length > 0 
                  ? (count / user.identityNodes.length) * 100 
                  : 0;

                return (
                  <div key={type}>
                    <div className="flex justify-between mb-2">
                      <span className="capitalize text-gray-300">{type}s</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full ${
                          type === 'habit' ? 'bg-green-500' :
                          type === 'goal' ? 'bg-blue-500' :
                          type === 'trait' ? 'bg-purple-500' :
                          type === 'emotion' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {user.identityNodes
                .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                .slice(0, 5)
                .map((node) => (
                  <div key={node.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div>
                      <span className="font-medium">{node.label}</span>
                      <span className="text-gray-400 text-sm ml-2">• {node.type}</span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(node.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </motion.div>
    </>
  );
};


