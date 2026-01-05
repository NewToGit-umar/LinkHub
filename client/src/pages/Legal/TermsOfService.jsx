import React from "react";
import { Link } from "react-router-dom";
import { Link2, ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-lime-500 rounded-xl flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">LinkHub</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-400 mb-8">Last updated: January 1, 2026</p>

          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using LinkHub, you accept and agree to be bound
                by the terms and conditions of this agreement. If you do not
                agree to these terms, please do not use our service.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-300 leading-relaxed">
                LinkHub provides a platform for creating bio link pages,
                scheduling social media posts, and managing your online
                presence. We reserve the right to modify, suspend, or
                discontinue the service at any time without notice.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                3. User Accounts
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                When you create an account with us, you must:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your password</li>
                <li>
                  Accept responsibility for all activities under your account
                </li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                4. Acceptable Use
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You agree not to use LinkHub to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Spam or send unsolicited messages</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with other users' enjoyment of the service</li>
              </ul>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                5. Content Ownership
              </h2>
              <p className="text-gray-300 leading-relaxed">
                You retain ownership of the content you create on LinkHub. By
                posting content, you grant us a non-exclusive, worldwide,
                royalty-free license to use, display, and distribute your
                content in connection with our service.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                6. Intellectual Property
              </h2>
              <p className="text-gray-300 leading-relaxed">
                The LinkHub service, including its original content, features,
                and functionality, is owned by LinkHub and protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property laws.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                7. Termination
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We may terminate or suspend your account immediately, without
                prior notice, for any reason whatsoever, including without
                limitation if you breach the Terms. Upon termination, your right
                to use the service will immediately cease.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                8. Limitation of Liability
              </h2>
              <p className="text-gray-300 leading-relaxed">
                In no event shall LinkHub, nor its directors, employees,
                partners, agents, suppliers, or affiliates, be liable for any
                indirect, incidental, special, consequential, or punitive
                damages, including without limitation, loss of profits, data,
                use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                9. Disclaimer
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Your use of the service is at your sole risk. The service is
                provided on an "AS IS" and "AS AVAILABLE" basis. The service is
                provided without warranties of any kind, whether express or
                implied.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                10. Changes to Terms
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify or replace these Terms at any
                time. If a revision is material, we will try to provide at least
                30 days' notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                11. Contact Us
              </h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these Terms, please contact us
                at:
              </p>
              <p className="text-emerald-400 mt-2">support@linkhub.com</p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          © 2026 LinkHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
