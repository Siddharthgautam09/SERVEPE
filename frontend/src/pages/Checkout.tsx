import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { service, selectedPlan } = location.state || {};

  // Placeholder state for form and files
  const [requirement, setRequirement] = useState('');
  const [overview, setOverview] = useState('');
  const [files, setFiles] = useState([
    { name: 'Patient#2937 biling.pdf', progress: 92, status: 'uploading' },
    { name: 'Patient#7656 biling.pdf', progress: 100, status: 'success', size: '12MB' },
    { name: 'Patient#4733 biling.pdf', progress: 0, status: 'error' },
    { name: 'Patient#7363 biling.pdf', progress: 98, status: 'uploading' },
  ]);
  const [coupon, setCoupon] = useState('');

  // Placeholder payment summary
  const itemTotal = 999;
  const itemDiscount = 500;
  const taxes = 90;
  const serviceCharge = 5;
  const couponDiscount = 5;
  const total = itemTotal - itemDiscount + taxes + serviceCharge - couponDiscount;

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <header className="bg-white py-4 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/public/images/logo-2.png" alt="Logo" className="h-8 w-auto" />
            <span className="font-bold text-xl text-gray-800">SERVPE</span>
          </div>
          <div className="flex-1 flex items-center max-w-lg mx-auto">
            <input type="text" placeholder="Search for services..." className="rounded-lg border border-gray-300 px-4 py-2 w-full" />
          </div>
          <div className="flex items-center gap-2">
            {/* User avatar/menu if needed */}
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-10">
        {/* Left: Requirements Form */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Submit Your Requirements</h2>
          <div className="mb-6">
            <label className="font-semibold text-sm mb-2 block">What do you need?</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[60px]"
              placeholder="Project overview and any external link or file links"
              value={requirement}
              onChange={e => setRequirement(e.target.value)}
            />
            <label className="font-semibold text-sm mb-2 block">Project Requirement Overview</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[60px]"
              placeholder="Submit your requirements & explain properly to match your expectation"
              value={overview}
              onChange={e => setOverview(e.target.value)}
            />
          </div>
          {/* File Upload */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center py-8 mb-6">
              <div className="mb-2">
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="12" fill="#F3F4F6"/><path d="M12 16V8m0 0-3 3m3-3 3 3" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="18" width="16" height="2" rx="1" fill="#E5E7EB"/></svg>
              </div>
              <div className="font-semibold text-gray-700 mb-1">Upload your file here</div>
              <div className="text-xs text-gray-400">Max file size 2GB</div>
            </div>
            {/* File List */}
            <div className="space-y-3">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center bg-white rounded-lg px-4 py-2 shadow border border-gray-100">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="bg-blue-100 text-blue-600 rounded p-1 text-xs font-bold">PDF</span>
                    <span className="text-sm font-medium text-gray-800">{file.name}</span>
                    {file.size && <span className="text-xs text-gray-400">{file.size}</span>}
                  </div>
                  {file.status === 'uploading' && (
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-2 bg-yellow-400" style={{ width: `${file.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{file.progress}%</span>
                    </div>
                  )}
                  {file.status === 'success' && (
                    <span className="text-green-600 text-xs font-semibold ml-2">Success</span>
                  )}
                  {file.status === 'error' && (
                    <span className="text-red-500 text-xs font-semibold ml-2">Failed to upload</span>
                  )}
                  <button className="ml-2 text-gray-400 hover:text-red-500">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Right: Checkout Summary */}
        <div>
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Checkout</h2>
            <div className="flex items-center gap-4 mb-4">
              <img src={service?.images?.[0]?.url || '/public/images/logo-2.png'} alt="Service" className="w-16 h-16 rounded-lg object-cover" />
              <div>
                <div className="font-semibold text-gray-800 text-sm">{service?.title || 'Service Title'}</div>
                <div className="text-xs text-gray-400 line-through">₹999.0</div>
                <div className="font-bold text-lg text-gray-900">₹499.0</div>
              </div>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
              />
              <a href="#" className="text-xs text-blue-600 font-semibold">View Coupons</a>
            </div>
            <div className="mb-4">
              <div className="font-semibold text-sm mb-2">Payment summary</div>
              <div className="flex justify-between text-sm mb-1">
                <span>Item total</span>
                <span>₹{itemTotal}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-600 cursor-pointer">Item Discount</span>
                <span className="text-green-600">-₹{itemDiscount}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Taxes GST</span>
                <span>₹{taxes}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Service charge <span className="text-gray-400 cursor-pointer" title="Platform fee">ⓘ</span></span>
                <span>₹{serviceCharge}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Coupon Discount</span>
                <span className="text-green-600">-₹{couponDiscount}</span>
              </div>
              <div className="flex justify-between text-base font-bold mt-2">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
              <div className="bg-green-50 text-green-700 text-xs rounded-lg px-3 py-2 mt-2 flex items-center">
                <span>Yay! You have saved ₹{itemDiscount} on final bill</span>
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-2">
              Continue to Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;