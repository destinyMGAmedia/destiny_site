import { useState } from 'react'

function Giving() {
  const [activeTab, setActiveTab] = useState('one-time')
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-900 to-pink-600 text-white py-32 mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
            Give Securely
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            &quot;Bring the whole tithe into the storehouse...&quot; – Malachi 3:10
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-4xl pb-20">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('one-time')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'one-time'
                ? 'bg-primary-900 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            One-Time
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'recurring'
                ? 'bg-primary-900 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Recurring
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary-900 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">💳</div>
                <div className="text-sm font-semibold">Card</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'transfer'
                    ? 'border-primary-900 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">🏦</div>
                <div className="text-sm font-semibold">Bank Transfer</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('mobile')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'mobile'
                    ? 'border-primary-900 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">📱</div>
                <div className="text-sm font-semibold">Mobile Money</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('ussd')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'ussd'
                    ? 'border-primary-900 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-2">*</div>
                <div className="text-sm font-semibold">USSD</div>
              </button>
            </div>
          </div>

          {/* Card Payment Form */}
          {paymentMethod === 'card' && (
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault()
              // Integrate with Flutterwave or Paystack here
              alert('Payment gateway integration - Connect your Flutterwave/Paystack account')
            }}>
              <div className="flex flex-wrap gap-2">
                {[10, 50, 100, 500].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amount)
                      setCustomAmount('')
                    }}
                    className={`px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${
                      selectedAmount === amount
                        ? 'border-accent-300 bg-yellow-50 text-primary-900'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Custom Amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setSelectedAmount(null)
                  }}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg flex-1 min-w-[120px]"
                />
              </div>
              <select name="category" required className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                <option value="">Select Category</option>
                <option>Tithe</option>
                <option>Offering</option>
                <option>Missions</option>
                <option>Building Fund</option>
                <option>Other</option>
              </select>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <button
                type="submit"
                className="w-full px-6 py-3 bg-accent-300 text-primary-900 rounded-lg font-semibold hover:bg-accent-400 transform hover:-translate-y-1 transition-all duration-300"
              >
                Pay with Card
              </button>
              <p className="text-xs text-gray-500 text-center">
                Secure payment powered by Flutterwave/Paystack
              </p>
            </form>
          )}

          {/* Bank Transfer Details */}
          {paymentMethod === 'transfer' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary-900 mb-4">Bank Transfer Details</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Bank Name:</span>
                    <span>Access Bank</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Account Name:</span>
                    <span>Destiny Mission Global Assembly</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Account Number:</span>
                    <span className="font-mono">0123456789</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">SWIFT Code:</span>
                    <span className="font-mono">ABNGNGLA</span>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> After making a transfer, please send proof of payment to{' '}
                      <a href="mailto:giving@dmga.org" className="text-primary-900 underline">giving@dmga.org</a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary-900 mb-4">Alternative Bank</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Bank Name:</span>
                    <span>GTBank</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Account Name:</span>
                    <span>Destiny Mission Global Assembly</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Account Number:</span>
                    <span className="font-mono">9876543210</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Money */}
          {paymentMethod === 'mobile' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary-900 mb-4">Mobile Money Options</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">📱</span>
                      <h4 className="font-bold text-gray-900">MTN Mobile Money</h4>
                    </div>
                    <p className="text-gray-700 mb-2">Send to: <span className="font-mono font-semibold">0803 123 4567</span></p>
                    <p className="text-sm text-gray-600">Name: Destiny Mission Global Assembly</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">📱</span>
                      <h4 className="font-bold text-gray-900">Airtel Money</h4>
                    </div>
                    <p className="text-gray-700 mb-2">Send to: <span className="font-mono font-semibold">0802 123 4567</span></p>
                    <p className="text-sm text-gray-600">Name: Destiny Mission Global Assembly</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">📱</span>
                      <h4 className="font-bold text-gray-900">OPay</h4>
                    </div>
                    <p className="text-gray-700 mb-2">Send to: <span className="font-mono font-semibold">0808 123 4567</span></p>
                    <p className="text-sm text-gray-600">Name: Destiny Mission Global Assembly</p>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> After payment, send proof to{' '}
                      <a href="mailto:giving@dmga.org" className="text-primary-900 underline">giving@dmga.org</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USSD */}
          {paymentMethod === 'ussd' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary-900 mb-4">USSD Payment Codes</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">*</span>
                      <h4 className="font-bold text-gray-900">GTBank USSD</h4>
                    </div>
                    <p className="text-gray-700 mb-2">Dial: <span className="font-mono font-semibold text-lg">*737*9876543210*Amount#</span></p>
                    <p className="text-sm text-gray-600">Example: *737*9876543210*1000#</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">*</span>
                      <h4 className="font-bold text-gray-900">Access Bank USSD</h4>
                    </div>
                    <p className="text-gray-700 mb-2">Dial: <span className="font-mono font-semibold text-lg">*901*0123456789*Amount#</span></p>
                    <p className="text-sm text-gray-600">Example: *901*0123456789*1000#</p>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>How to use:</strong> Dial the code on your phone, enter your PIN, and confirm the transaction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Giving

