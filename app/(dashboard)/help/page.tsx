'use client';

import React, { useState } from "react";
import { HelpCircle, Mail, Phone, Search } from 'lucide-react';

export default function HelpSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("faq");
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const faqItems = [
    {
      question: "How do I add a new transaction?",
      answer: "To add a new transaction, go to the Transactions page and click the 'Add Transaction' button. Fill in the details including description, category, amount, and type (income or expense), then click 'Add Transaction' to save it."
    },
    {
      question: "How can I set up budget categories?",
      answer: "Navigate to the Budgets page and click 'Add Budget'. Choose a category, set your monthly budget amount, and save. You can track your spending progress and get alerts when you're close to your limit."
    },
    {
      question: "What happens when I exceed my budget?",
      answer: "When you exceed your budget, the system will show a red 'Over Budget' badge and calculate how much you've overspent. If you have notifications enabled, you'll receive alerts about budget overruns."
    },
    {
      question: "How do I create savings goals?",
      answer: "Go to the Savings Goals page and click 'Add Goal'. Enter your goal name, description, target amount, and deadline. You can track your progress and add money to your goals as you save."
    },
    {
      question: "Is my financial data secure?",
      answer: "Yes, we use industry-standard encryption to protect your data. You can enable two-factor authentication in your security settings for additional protection. We never share your personal financial information with third parties."
    },
    {
      question: "How do I delete my account?",
      answer: "To delete your account, go to your Profile page, select the 'Account' tab, and scroll to the 'Danger Zone' section. Please note that this action is permanent and cannot be undone."
    }
  ];

  const filteredFAQs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAccordionClick = (value: string) => {
    setOpenAccordion(openAccordion === value ? null : value);
  };

  return (
    <div className="bg-gray-100 font-sans p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-purple-700">Help & Support</h1>
          <p className="mt-2 text-gray-600 text-lg">
            Get help with FinanceTracker and find answers to common questions.
          </p>
        </div>

        {/* Tabs */}
        <div className="space-y-8">
          <div className="grid w-full grid-cols-2 p-1 bg-gray-200 rounded-lg shadow-inner">
            <button
              onClick={() => setActiveTab("faq")}
              className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200
                ${activeTab === "faq" ? 'bg-white shadow text-purple-700' : 'text-gray-600 hover:text-purple-700 hover:bg-gray-100'}`}
            >
              FAQ
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200
                ${activeTab === "contact" ? 'bg-white shadow text-purple-700' : 'text-gray-600 hover:text-purple-700 hover:bg-gray-100'}`}
            >
              Contact Us
            </button>
          </div>

          {/* FAQ Tab Content */}
          {activeTab === "faq" && (
            <div className="p-8 border border-gray-200 bg-white rounded-2xl shadow-lg space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-purple-700">Frequently Asked Questions</h3>
                <p className="text-gray-600 text-base mt-1">
                  Find quick answers to the most common questions about FinanceTracker.
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  className="pl-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* FAQ Accordion */}
              <div className="w-full">
                {filteredFAQs.map((item, index) => (
                  <div key={index} className="border-b border-gray-200">
                    <button
                      onClick={() => handleAccordionClick(`item-${index}`)}
                      className="flex justify-between items-center w-full py-4 text-left font-medium text-gray-800 transition-all hover:text-purple-900"
                    >
                      <span>{item.question}</span>
                      <svg className={`h-5 w-5 shrink-0 transition-transform duration-300 ${openAccordion === `item-${index}` ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                    </button>
                    {openAccordion === `item-${index}` && (
                      <div className="pb-4 text-sm text-gray-600 leading-relaxed">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-10">
                  <HelpCircle className="mx-auto h-14 w-14 text-gray-400" />
                  <h3 className="mt-3 text-base font-semibold text-gray-900">No results found</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Try adjusting your search terms or contact support for help.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Contact Us Tab Content */}
          {activeTab === "contact" && (
            <div className="p-8 border border-gray-200 bg-white rounded-2xl shadow-lg space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-purple-700">Contact Information</h3>
                <p className="text-gray-600 text-base mt-1">
                  For direct assistance, you can reach us through the following channels.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Email Card */}
                <div className="flex items-center space-x-4 p-5 rounded-xl border border-gray-200 bg-gray-50 hover:shadow-md transition-all">
                  <Mail className="w-6 h-6 text-purple-700" />
                  <div>
                    <div className="font-semibold text-gray-800">Email</div>
                    <a href="mailto:beimnetasnin@gmail.com" className="text-sm text-purple-700 hover:underline">beimnetasnin@gmail.com</a>
                  </div>
                </div>
                {/* Phone Card */}
                <div className="flex items-center space-x-4 p-5 rounded-xl border border-gray-200 bg-gray-50 hover:shadow-md transition-all">
                  <Phone className="w-6 h-6 text-purple-700" />
                  <div>
                    <div className="font-semibold text-gray-800">Phone</div>
                    <a href="tel:+251989972291" className="text-sm text-purple-700 hover:underline">+251989972291</a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
