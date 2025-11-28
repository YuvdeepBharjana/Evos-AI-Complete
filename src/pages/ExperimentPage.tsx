import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Flame, Calendar, Trophy, Target, ArrowLeft, Play, 
  CheckCircle, Clock, Star, Zap, Award, TrendingUp
} from 'lucide-react';
import { getExperiment, startExperiment, type ExperimentData } from '../lib/api';

export const ExperimentPage = () => {
  const [experiment, setExperiment] = useState<ExperimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    loadExperiment();
  }, []);

  const loadExperiment = async () => {
    const data = await getExperiment();
    setExperiment(data);
    setLoading(false);
  };

  const handleStart = async () => {
    setStarting(true);
    const result = await startExperiment();
    if (result.success) {
      loadExperiment();
    }
    setStarting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const milestoneIcons: Record<string, JSX.Element> = {
    'experiment_started': <Play className="w-5 h-5" />,
    'day_7': <Star className="w-5 h-5" />,
    'day_14': <Zap className="w-5 h-5" />,
    'day_21': <Award className="w-5 h-5" />,
    'day_30': <Trophy className="w-5 h-5" />,
    'streak_7': <Flame className="w-5 h-5" />,
    'streak_14': <Flame className="w-5 h-5" />,
    'streak_21': <Flame className="w-5 h-5" />,
    'streak_30': <Flame className="w-5 h-5" />,
  };

  const milestoneLabels: Record<string, string> = {
    'experiment_started': 'Journey Started',
    'day_7': 'Week 1 Complete',
    'day_14': 'Halfway There',
    'day_21': 'Habit Formed',
    'day_30': 'Experiment Complete',
    'streak_7': '7 Day Streak',
    'streak_14': '14 Day Streak',
    'streak_21': '21 Day Streak',
    'streak_30': '30 Day Streak',
  };

  return (
    <div className="w-full bg-[#030014] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-indigo-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/dashboard" 
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="text-xs text-indigo-400 font-medium mb-1">BETA EXPERIMENT</div>
            <h1 className="text-3xl font-bold">30-Day Identity Engineering</h1>
          </div>
        </div>

        {!experiment?.started ? (
          /* Not Started State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 mb-8">
              <Calendar className="w-12 h-12 text-indigo-400" />
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              Ready to transform in 30 days?
            </h2>
            
            <p className="text-xl text-gray-400 max-w-xl mx-auto mb-8">
              Join our beta experiment. Track your identity engineering journey 
              for 30 days and watch yourself evolve.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-semibold mb-1">Daily Actions</div>
                <div className="text-sm text-gray-500">3 proof-moves every day</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-3xl mb-2">📊</div>
                <div className="font-semibold mb-1">Track Everything</div>
                <div className="text-sm text-gray-500">5 metrics, daily</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-3xl mb-2">🧠</div>
                <div className="font-semibold mb-1">Watch Evolution</div>
                <div className="text-sm text-gray-500">See your identity shift</div>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={starting}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center gap-3 mx-auto"
            >
              {starting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start My 30 Days
                </>
              )}
            </button>

            <p className="text-gray-600 text-sm mt-4">
              Free during beta. No credit card required.
            </p>
          </motion.div>
        ) : (
          /* Active Experiment */
          <div className="space-y-8">
            {/* Progress Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-white/10 rounded-2xl p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-indigo-500/20 to-transparent blur-2xl" />
              
              <div className="relative flex flex-col md:flex-row items-center gap-8">
                {/* Day Counter */}
                <div className="text-center">
                  <div className="text-8xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {experiment.dayNumber}
                  </div>
                  <div className="text-gray-400 mt-2">of 30 days</div>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 w-full">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-indigo-400 font-medium">{experiment.progress}%</span>
                  </div>
                  <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${experiment.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{experiment.startDate}</span>
                    <span>{experiment.endDate}</span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-400">
                    <Flame className="w-6 h-6" />
                    {experiment.currentStreak}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Current Streak</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-400">
                    <Trophy className="w-6 h-6" />
                    {experiment.longestStreak}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Best Streak</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-cyan-400">
                    <Clock className="w-6 h-6" />
                    {experiment.daysRemaining}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Days Left</div>
                </div>
              </div>

              {experiment.isCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center backdrop-blur-sm"
                >
                  <div className="text-center">
                    <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-3xl font-bold mb-2">🎉 Experiment Complete!</h3>
                    <p className="text-gray-300">You did it. 30 days of identity engineering.</p>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Activity Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                Activity Calendar
              </h3>
              
              <div className="grid grid-cols-7 gap-2">
                {/* Day labels */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs text-gray-500 pb-2">{day}</div>
                ))}
                
                {/* Generate 30 days of boxes */}
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = i - new Date(experiment.startDate!).getDay() + 1;
                  const isValidDay = dayNum >= 1 && dayNum <= 30;
                  const date = isValidDay 
                    ? new Date(new Date(experiment.startDate!).getTime() + (dayNum - 1) * 24 * 60 * 60 * 1000)
                      .toISOString().split('T')[0]
                    : null;
                  const activity = experiment.activities?.find(a => a.date === date);
                  const isToday = date === new Date().toISOString().split('T')[0];
                  const isPast = date && date < new Date().toISOString().split('T')[0];
                  const hasActivity = activity && (activity.actions_done > 0 || activity.tracked > 0);
                  
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                        !isValidDay ? 'opacity-0' :
                        isToday ? 'ring-2 ring-indigo-500 bg-indigo-500/20 text-white' :
                        hasActivity ? 'bg-green-500/30 text-green-300' :
                        isPast ? 'bg-red-500/20 text-red-400' :
                        'bg-white/5 text-gray-500'
                      }`}
                    >
                      {isValidDay ? dayNum : ''}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500/30" />
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500/20" />
                  <span>Missed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded ring-2 ring-indigo-500 bg-indigo-500/20" />
                  <span>Today</span>
                </div>
              </div>
            </motion.div>

            {/* Milestones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Milestones
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {['day_7', 'day_14', 'day_21', 'day_30'].map((milestone) => {
                  const achieved = experiment.milestones?.some(m => m.type === milestone);
                  const dayNum = parseInt(milestone.split('_')[1]);
                  const isUpcoming = experiment.dayNumber! < dayNum;
                  
                  return (
                    <div
                      key={milestone}
                      className={`p-4 rounded-xl text-center transition-all ${
                        achieved 
                          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                          : isUpcoming
                          ? 'bg-white/5 border border-white/10 opacity-50'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                        achieved ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 text-gray-500'
                      }`}>
                        {achieved ? <CheckCircle className="w-5 h-5" /> : milestoneIcons[milestone]}
                      </div>
                      <div className={`text-sm font-medium ${achieved ? 'text-yellow-400' : 'text-gray-400'}`}>
                        Day {dayNum}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {milestoneLabels[milestone]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                <Target className="w-5 h-5" />
                Complete Today's Actions
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

