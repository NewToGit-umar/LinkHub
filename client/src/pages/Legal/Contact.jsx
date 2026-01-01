import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Link2,
  ArrowLeft,
  Send,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  HelpCircle,
  Bug,
  Briefcase,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

const contactReasons = [
  { id: "general", label: "General Inquiry", icon: MessageSquare },
  { id: "support", label: "Technical Support", icon: HelpCircle },
  { id: "bug", label: "Report a Bug", icon: Bug },
  { id: "business", label: "Business Partnership", icon: Briefcase },
];

const faqs = [
  {
    question: "What is LinkHub?",
    answer:
      "LinkHub is an all-in-one platform for managing your online presence. Create beautiful bio link pages, schedule social media posts, track analytics, and collaborate with your team - all from one dashboard.",
  },
  {
    question: "Is LinkHub free to use?",
    answer:
      "Yes! LinkHub offers a free forever plan that includes essential features like bio link pages, basic analytics, and limited post scheduling. We also offer premium plans with advanced features for power users and teams.",
  },
  {
    question: "How do I create a bio link page?",
    answer:
      "After signing up, navigate to the 'Bio Pages' section in your dashboard. Click 'Create New Page', choose a template, add your links, customize the design, and publish. Your page will be live instantly at linkhub.io/yourusername.",
  },
  {
    question: "Which social media platforms are supported?",
    answer:
      "LinkHub supports all major social media platforms including Twitter/X, Instagram, Facebook, LinkedIn, TikTok, and YouTube. You can connect multiple accounts and manage them all from one place.",
  },
  {
    question: "Can I schedule posts in advance?",
    answer:
      "Absolutely! With LinkHub's post scheduler, you can create and schedule posts for multiple platforms simultaneously. Set the date and time, and LinkHub will automatically publish your content.",
  },
  {
    question: "How do I track my link performance?",
    answer:
      "LinkHub provides detailed analytics for all your links and bio pages. Track views, clicks, click-through rates, geographic data, and more. Access your analytics dashboard to see real-time insights.",
  },
  {
    question: "Can I collaborate with my team?",
    answer:
      "Yes! LinkHub offers team collaboration features. Invite team members, assign roles and permissions, and work together on content creation and scheduling. Perfect for agencies and marketing teams.",
  },
  {
    question: "How do I reset my password?",
    answer:
      "Click on 'Forgot Password' on the login page, enter your email address, and we'll send you a password reset link. The link expires after 1 hour for security reasons.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, security is our top priority. We use industry-standard encryption, secure servers, and regular security audits. Your data is never sold to third parties. Read our Privacy Policy for more details.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "You can delete your account from Settings > Privacy > Delete Account. Please note that this action is irreversible and all your data, including bio pages and scheduled posts, will be permanently deleted.",
  },
];

// FAQ Accordion Item Component
function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={onClick}
        className="w-full px-6 py-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors text-left"
      >
        <span className="text-white font-medium pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <p className="px-6 py-4 text-gray-400 leading-relaxed bg-white/[0.02]">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "general",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Message sent successfully! We'll get back to you soon.");

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        reason: "general",
        subject: "",
        message: "",
      });
    }, 3000);
  };

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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Get in Touch</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Have a question, feedback, or just want to say hello? We'd love to
              hear from you. Fill out the form below and we'll get back to you
              as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Email Us</h3>
                    <p className="text-gray-400 text-sm">support@linkhub.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Location</h3>
                    <p className="text-gray-400 text-sm">Islamabad, Pakistan</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Response Time</h3>
                    <p className="text-gray-400 text-sm">Within 24-48 hours</p>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="bg-gradient-to-br from-emerald-600/20 to-lime-500/20 rounded-2xl p-6 border border-emerald-500/30">
                <h3 className="text-white font-semibold mb-2">
                  Looking for quick answers?
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Check out our FAQ section for answers to common questions.
                </p>
                <a
                  href="#faq"
                  className="text-emerald-400 hover:text-emerald-300 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  View FAQ
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-gray-400">
                      Thank you for reaching out. We'll get back to you within
                      24-48 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contact Reason */}
                    <div>
                      <label className="block text-white font-medium mb-3">
                        What can we help you with?
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {contactReasons.map((reason) => (
                          <button
                            key={reason.id}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                reason: reason.id,
                              }))
                            }
                            className={`p-4 rounded-xl border transition-all text-center ${
                              formData.reason === reason.id
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                            }`}
                          >
                            <reason.icon className="w-5 h-5 mx-auto mb-2" />
                            <span className="text-xs font-medium">
                              {reason.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-white font-medium mb-2"
                        >
                          Your Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-white font-medium mb-2"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-white font-medium mb-2"
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="How can we help?"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-white font-medium mb-2"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-emerald-600 to-lime-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div id="faq" className="mt-20 scroll-mt-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Find quick answers to common questions about LinkHub. Can't find
                what you're looking for? Feel free to contact us using the form
                above.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === index}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                />
              ))}
            </div>

            {/* Still have questions */}
            <div className="mt-12 text-center">
              <p className="text-gray-400 mb-4">Still have questions?</p>
              <a
                href="#top"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-lime-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                <MessageSquare className="w-5 h-5" />
                Contact Us
              </a>
            </div>
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
