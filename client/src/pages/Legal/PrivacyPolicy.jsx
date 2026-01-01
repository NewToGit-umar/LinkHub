import React from "react";
import { Link } from "react-router-dom";
import { Link2, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400 mb-8">Last updated: January 1, 2026</p>

          <div className="prose prose-invert prose-lg max-w-none space-y-8">
            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Welcome to LinkHub. We respect your privacy and are committed to
                protecting your personal data. This privacy policy explains how
                we collect, use, and safeguard your information when you use our
                service.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                2. Information We Collect
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Account information (name, email address, password)</li>
                <li>Profile information (bio, avatar, social links)</li>
                <li>Content you create (bio pages, scheduled posts, links)</li>
                <li>Communications with us (support requests, feedback)</li>
              </ul>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>
                  Send you technical notices, updates, and support messages
                </li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>
                  Detect, investigate, and prevent fraudulent transactions
                </li>
              </ul>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                4. Information Sharing
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information only in the
                following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4">
                <li>With your consent or at your direction</li>
                <li>With service providers who assist in our operations</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
              </ul>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We implement appropriate technical and organizational measures
                to protect your personal data against unauthorized access,
                alteration, disclosure, or destruction. This includes
                encryption, secure servers, and regular security assessments.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                6. Your Rights
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                7. Cookies
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We use cookies and similar tracking technologies to track
                activity on our service and hold certain information. You can
                instruct your browser to refuse all cookies or to indicate when
                a cookie is being sent.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-semibold text-white mb-4">
                8. Contact Us
              </h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy, please
                contact us at:
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
