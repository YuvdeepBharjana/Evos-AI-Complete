import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dna, ArrowLeft } from 'lucide-react';

export const TermsPage = () => {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-gray-400 mb-12">Last Updated: {currentDate}</p>

            <div className="prose prose-invert prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-300 leading-relaxed">
                  By accessing or using Evos AI ("the Service"), you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                <p className="text-gray-300 leading-relaxed">
                  Evos AI is an identity visualization platform that analyzes user-provided text to generate 
                  psychological insights and visualizations. The Service is for personal development purposes only 
                  and does not constitute professional psychological, medical, or therapeutic advice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                <ul className="text-gray-300 space-y-2 list-disc pl-6">
                  <li>You must provide accurate information when creating an account</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>You must be at least 18 years old to use the Service</li>
                  <li>One person may not maintain multiple accounts</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. User Content</h2>
                <ul className="text-gray-300 space-y-2 list-disc pl-6">
                  <li>You retain ownership of any content you submit to the Service</li>
                  <li>By submitting content, you grant Evos AI a license to process and analyze it for the purpose of providing the Service</li>
                  <li>You agree not to submit content that is illegal, harmful, or violates others' rights</li>
                  <li>We do not use your content to train public AI models</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Privacy</h2>
                <p className="text-gray-300 leading-relaxed">
                  Your privacy is important to us. Please review our <Link to="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link> for 
                  information about how we collect, use, and protect your data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Prohibited Uses</h2>
                <p className="text-gray-300 leading-relaxed mb-4">You agree not to:</p>
                <ul className="text-gray-300 space-y-2 list-disc pl-6">
                  <li>Use the Service for any illegal purpose</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper functioning of the Service</li>
                  <li>Use the Service to harm or harass others</li>
                  <li>Reverse engineer or attempt to extract the source code</li>
                  <li>Use automated systems to access the Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
                <p className="text-gray-300 leading-relaxed">
                  The Service, including its original content, features, and functionality, is owned by Evos AI 
                  and is protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimer of Warranties</h2>
                <p className="text-gray-300 leading-relaxed">
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. 
                  EVOS AI DOES NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. 
                  THE INSIGHTS PROVIDED ARE FOR INFORMATIONAL PURPOSES ONLY AND SHOULD NOT REPLACE PROFESSIONAL ADVICE.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-300 leading-relaxed">
                  EVOS AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE 
                  DAMAGES ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT 
                  YOU PAID US IN THE PAST 12 MONTHS.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Changes to Terms</h2>
                <p className="text-gray-300 leading-relaxed">
                  We may update these Terms at any time. We will notify you of significant changes by posting 
                  the new Terms on this page and updating the "Last Updated" date. Continued use of the Service 
                  after changes constitutes acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">11. Termination</h2>
                <p className="text-gray-300 leading-relaxed">
                  We may terminate or suspend your account at any time for violations of these Terms. 
                  You may also delete your account at any time through your account settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">12. Contact</h2>
                <p className="text-gray-300 leading-relaxed">
                  For questions about these Terms, contact us at{' '}
                  <a href="mailto:legal@evos.ai" className="text-purple-400 hover:text-purple-300">legal@evos.ai</a>
                </p>
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
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
          <p className="text-sm text-gray-600">© 2024 Evos AI. The world's first identity engineering platform.</p>
        </div>
      </footer>
    </div>
  );
};

