import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQManager: React.FC = () => {
  // Initial mock data
  const initialFAQs: FAQItem[] = [
    { id: '1', question: 'How do I reset my password?', answer: 'Go to Settings > Security > Reset Password.' },
    { id: '2', question: 'What payment methods do you accept?', answer: 'We accept Visa, MasterCard, and PayPal.' },
    { id: '3', question: 'How long does shipping take?', answer: 'Standard shipping takes 3-5 business days.' },
  ];

  // State
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  // Add new FAQ
  const handleAdd = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    
    const newFAQ: FAQItem = {
      id: Date.now().toString(),
      question: newQuestion,
      answer: newAnswer,
    };

    setFaqs([...faqs, newFAQ]);
    setNewQuestion('');
    setNewAnswer('');
  };

  // Start editing
  const startEdit = (faq: FAQItem) => {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  };

  // Save edit
  const saveEdit = () => {
    if (!editingId) return;

    setFaqs(faqs.map(faq => 
      faq.id === editingId 
        ? { ...faq, question: editQuestion, answer: editAnswer }
        : faq
    ));

    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  // Delete FAQ
  const deleteFAQ = (id: string) => {
    setFaqs(faqs.filter(faq => faq.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
        <p className="text-gray-600 mt-1">Manage your FAQ items</p>
      </div>

      {/* Add New FAQ */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Add New FAQ</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          <textarea
            placeholder="Answer"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            rows={2}
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FiPlus className="mr-2" />
            Add FAQ
          </button>
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white border border-gray-200 rounded-lg p-4">
            {editingId === faq.id ? (
              // Edit Mode
              <div className="space-y-3">
                <input
                  type="text"
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-medium"
                />
                <textarea
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={saveEdit}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <FiSave className="mr-1" />
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                  >
                    <FiX className="mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{faq.question}</h4>
                    <p className="text-gray-600 mt-1">{faq.answer}</p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => startEdit(faq)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteFAQ(faq.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQManager;