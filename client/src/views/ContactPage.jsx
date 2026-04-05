import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SUBJECTS = [
  'নিখোঁজ রিপোর্ট সহায়তা',
  'প্রযুক্তিগত সমস্যা',
  'অংশীদারিত্ব',
  'সাধারণ জিজ্ঞাসা',
];

const initialForm = { name: '', phone: '', email: '', subject: '', message: '' };

const ContactPage = () => {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('নাম, ইমেইল, বিষয় এবং বার্তা পূরণ করুন।');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/contact', form);
      setSubmitted(true);
      setForm(initialForm);
    } catch (err) {
      const msg = err?.response?.data?.error || 'বার্তা পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-black mb-3">যোগাযোগ করুন</h1>
        <p className="text-white/80 max-w-md mx-auto text-sm">
          আমাদের সাথে যোগাযোগ করতে নিচের ফর্ম পূরণ করুন বা সরাসরি ফোন করুন
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800 mb-6">আমাদের তথ্য</h2>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: 'জরুরি সহায়তা', value: '999 (পুলিশ)', sub: '১৬১২৩ (জাতীয় হেল্পলাইন)', color: 'text-accent-red bg-accent-red/10' },
                  { icon: Phone, label: 'আপনখোঁজ হেল্পলাইন', value: '01842-685725', sub: 'সকাল ৮টা — রাত ১০টা', color: 'text-primary bg-primary/10' },
                  { icon: Mail, label: 'ইমেইল', value: 'support@aponkhoj.com.bd', sub: 'সাধারণত ২৪ ঘণ্টার মধ্যে উত্তর', color: 'text-secondary bg-secondary/10' },
                  { icon: MapPin, label: 'ঠিকানা', value: 'বাড়ি ১২, রোড ৫, ধানমন্ডি', sub: 'ঢাকা — ১২০৫, বাংলাদেশ', color: 'text-accent-teal bg-accent-teal/10' },
                  { icon: Clock, label: 'অফিস সময়', value: 'রবি — বৃহস্পতিবার', sub: 'সকাল ৯টা — বিকাল ৬টা', color: 'text-gray-600 bg-gray-100' },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
                      <c.icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">{c.label}</p>
                      <p className="font-bold text-gray-800 text-sm">{c.value}</p>
                      <p className="text-xs text-gray-500">{c.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Box */}
            <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-5">
              <h3 className="font-bold text-accent-red flex items-center gap-2 mb-2">
                <Phone size={16} /> জরুরি পরিস্থিতিতে
              </h3>
              <p className="text-sm text-gray-600 mb-3">নিখোঁজ হওয়ার ৪৮ ঘণ্টার মধ্যে পুলিশকে জানান।</p>
              <a href="tel:999" className="text-3xl font-black text-accent-red">999</a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-16 h-16 bg-accent-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-accent-teal" />
                </div>
                <h2 className="text-xl font-black text-gray-800 mb-2">বার্তা পাঠানো হয়েছে!</h2>
                <p className="text-gray-500 text-sm">
                  আমরা আপনার ইমেইলে একটি নিশ্চিতকরণ পাঠিয়েছি এবং শীঘ্রই যোগাযোগ করব।
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm text-primary hover:underline"
                >
                  আবার পাঠান
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-gray-800 mb-6">বার্তা পাঠান</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        আপনার নাম <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="পূর্ণ নাম"
                        disabled={loading}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">ফোন নম্বর</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="01XXXXXXXXX"
                        disabled={loading}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      ইমেইল <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      disabled={loading}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      বিষয় <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white disabled:opacity-50"
                    >
                      <option value="">বিষয় নির্বাচন করুন</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      বার্তা <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="আপনার বার্তা লিখুন..."
                      disabled={loading}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none disabled:opacity-50"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><Loader2 size={16} className="animate-spin" /> পাঠানো হচ্ছে...</>
                    ) : (
                      <><Send size={16} /> বার্তা পাঠান</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;