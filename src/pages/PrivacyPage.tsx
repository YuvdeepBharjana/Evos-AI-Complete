import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dna, ArrowLeft } from 'lucide-react';

export const PrivacyPage = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-[#030014] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030014]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center">
              <Dna className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Evos</span>
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-gray-400 mb-12">Last Updated: {currentDate}</p>

            <div className="prose prose-invert prose-lg max-w-none space-y-8">
              <section className="glass rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed">
                  <strong className="text-white">TL;DR:</strong> Your data is yours. We analyze it to show you insights, 
                  but we don't sell it, share it, or use it to train public AI models. You can delete everything anytime.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-gray-200 mb-3">Information You Provide</h3>
                <ul className="text-gray-300 space-y-2 list-disc pl-6 mb-4">
                  <li>Account information (name, email)</li>
                  <li>Content you submit (text, chat logs, journal entries)</li>
                  <li>Questionnaire responses</li>
                  <li>Feedback and communications</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-200 mb-3">Information Collected Automatically</h3>
                <ul className="text-gray-300 space-y-2 list-disc pl-6">
                  <li>Usage data (pages visited, features used)</li>
                  <li>Device information (browser type, operating system)</li>
                  <li>Log data (IP address, access times)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                <ul className="text-gray-300 space-y-2 list-disc pl-6">
                  <li>To provide and improve the Service</li>
                  <li>To analyze your content and generate identity insights</li>
                  <li>To personalize your experience</li>
                  <li>To communicate with you about the Service</li>
                  <li>To ensure security and prevent fraud</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Data Processing</h2>
                <div className="glass rounded-xl p-6 mb-4">
                  <p className="text-gray-300 leading-relaxed">
                    <strong className="text-green-400">Important:</strong> Your submitted content is processed by AI 
                    to extract patterns and generate visualizations. We do <strong>NOT</strong> use your data to 
                    train public AI models. Your identity data is private to you.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Data Storage and Security</h2>
                <ul className="text-gray-300 space-y-2 list-disc pl-6">
                  <li>Data is encrypted in transit (TLS) and at rest (AES-256)</li>
                  <li>We use industry-standard security measures</li>
                  <li>Access to user data is strictly limited to essential personnel</li>
                  <li>We retain data only as long as necessary to provide the Service</li>
                  <li>You can request data deletion at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We do <strong className="text-white">NOT</strong> sell your personal data. We may share data only:
                </p>
                <ul className="text-gray-300 space-y-2 list-disc pl-6">
                  <li>With your explicit consent</li>
                  <li>With service providers who assist in operating the Service (under strict confidentiality)</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with a merger or acquisition (with notice to you)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
                <p className="text-gray-300 leading-relaxed mb-4">You have the right to:</p>
                <ul className="text-gray-300 space-y-2 list-disc pl-6">
                  <li><strong>Access</strong> your personal data</li>
                  <li><strong>Correct</strong> inaccurate data</li>
                  <li><strong>Delete</strong> your data ("right to be forgotten")</li>
                  <li><strong>Export</strong> your data in a portable format</li>
                  <li><strong>Withdraw consent</strong> at any time</li>
                  <li><strong>Object</strong> to certain processing activities</li>
                </ul>
                <p className="text-gray-400 mt-4">
                  To exercise these rights, contact us at{' '}
                  <a href="mailto:privacy@evos.ai" className="text-purple-400 hover:text-purple-300">privacy@evos.ai</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Cookies</h2>
                <p className="text-gray-300 leading-relaxed">
                  We use essential cookies to operate the Service (authentication, preferences). 
                  We may use analytics cookies with your consent to improve the Service. 
                  You can manage cookie preferences in your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
                <p className="text-gray-300 leading-relaxed">
                  The Service is not intended for users under 18 years of age. We do not knowingly collect 
                  data from minors. If you believe a minor has provided us with personal data, please contact us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. International Users</h2>
                <p className="text-gray-300 leading-relaxed">
                  Data may be processed in countries other than your own (e.g., United States). 
                  By using the Service, you consent to this transfer. We ensure appropriate safeguards 
                  are in place for international data transfers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
                <p className="text-gray-300 leading-relaxed">
                  We may update this Policy periodically. We will notify you of significant changes 
                  by email and by posting the new Policy on this page. Your continued use of the Service 
                  after changes constitutes acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
                <p className="text-gray-300 leading-relaxed">
                  For privacy questions or to exercise your rights:
                </p>
                <ul className="text-gray-300 space-y-2 mt-4">
                  <li>Email: <a href="mailto:privacy@evos.ai" className="text-purple-400 hover:text-purple-300">privacy@evos.ai</a></li>
                  <li>Data Protection Officer: <a href="mailto:dpo@evos.ai" className="text-purple-400 hover:text-purple-300">dpo@evos.ai</a></li>
                </ul>
              </section>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center">
              <Dna className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Evos</span>
            <span className="text-xs text-gray-600 border border-gray-800 rounded px-2 py-0.5">Identity Engineering</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/vision" className="hover:text-white transition-colors">Vision</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <p className="text-sm text-gray-600">© 2024 Evos AI. The world's first identity engineering platform.</p>
        </div>
      </footer>
    </div>
  );
};

