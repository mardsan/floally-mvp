import { useState } from 'react';

function LandingPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [struggle, setStruggle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [signupPosition, setSignupPosition] = useState(null);
  const [signupNote, setSignupNote] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Try Vercel serverless function first (always available)
      const vercelEndpoint = '/api/waitlist';
      
      const response = await fetch(vercelEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          struggle,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join waitlist');
      }

      const data = await response.json();
      setSignupPosition(data.position);
      setSignupNote(data.note || '');
      setSubmitted(true);
      // Track conversion
      if (window.gtag) {
        window.gtag('event', 'generate_lead', {
          value: 1,
          currency: 'USD',
        });
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Waitlist signup error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <div className="mb-8">
            <div className="inline-block animate-bounce">
              <span className="text-6xl">✨</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            You're on the list!
          </h1>
          {signupNote && (
            <p className="text-2xl font-semibold text-teal-600 mb-4">
              {signupNote}
            </p>
          )}
          <p className="text-xl text-gray-600 mb-8">
            Thanks {name}! We'll email you at <strong>{email}</strong> when early access opens.
          </p>
          <p className="text-gray-500 mb-8">
            In the meantime, we're building something special just for you.
          </p>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              What happens next?
            </h2>
            <ul className="text-left text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-teal-500 mr-2">✓</span>
                <span>We'll send you updates on our progress</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-500 mr-2">✓</span>
                <span>You'll get early access before the public launch</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-500 mr-2">✓</span>
                <span>Special founding member pricing (50% off for life)</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            ← Back to homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      {/* Header with Logo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex justify-center">
          <img 
            src="/okaimy-logo-01.png" 
            alt="OkAimy" 
            className="h-12 md:h-16 w-auto"
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="text-center mb-16">
          {/* Animated Aimy - Larger size for emotional impact */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full opacity-20 animate-pulse blur-2xl"></div>
              <video
                className="relative w-64 h-64 md:w-72 md:h-72 rounded-full object-cover shadow-2xl"
                autoPlay
                loop
                muted
                playsInline
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              >
                <source src="/opaimy-video-loop-720-01.mp4" type="video/mp4" />
              </video>
              <img
                src="/okaimy-static-01.png"
                alt="Aimy"
                className="hidden w-64 h-64 md:w-72 md:h-72 rounded-full object-cover shadow-2xl"
              />
```
            </div>
          </div>

          {/* Headline - Aimy speaking, smaller second line */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Stay in flow.
            <br />
            <span className="text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
              Let me handle the rest.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            I'm your AI partner for focusing on what matters while keeping everything else running smoothly.
          </p>

          {/* CTA */}
          <div className="inline-block bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Join Early Access
            </h2>
            <p className="text-gray-600 mb-6">
              Be among the first to experience OkAimy
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={struggle}
                  onChange={(e) => setStruggle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700"
                >
                  <option value="">How can Aimy help you most?</option>
                  <option value="too_many_emails">Managing my inbox</option>
                  <option value="losing_track">Keeping track of projects</option>
                  <option value="context_switching">Reducing context switching</option>
                  <option value="priorities">Clarifying priorities</option>
                  <option value="follow_up">Remembering to follow up</option>
                  <option value="other">Something else</option>
                </select>
              </div>

              {error && (
                <div className="text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold py-4 rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? 'Joining...' : 'Get Early Access'}
              </button>

              <p className="text-xs text-gray-500">
                Join 50+ creative professionals already on the waitlist
              </p>
            </form>
          </div>
        </div>

        {/* Value Proposition - 3 Panels */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              "The One Thing"
            </h3>
            <p className="text-gray-600">
              Every morning, Aimy analyzes your inbox and tells you exactly what matters most. 
              No more decision fatigue. Just clarity.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Daily Standup Partnership
            </h3>
            <p className="text-gray-600">
              You and Aimy sync up each day. You focus on creating. 
              Aimy handles the follow-ups, reminders, and coordination.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Nothing Falls Through
            </h3>
            <p className="text-gray-600">
              Sleep peacefully knowing Aimy's got your back. 
              She tracks everything, so you can stay in flow.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Screenshot placeholder - will be replaced with actual screenshot */}
            <div className="bg-gradient-to-br from-teal-100 to-emerald-100 p-12">
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Left Side - You */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-300 mr-3"></div>
                    <div>
                      <div className="font-bold text-gray-900">You</div>
                      <div className="text-sm text-gray-500">Your Focus</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-teal-50 rounded-lg p-4">
                      <div className="font-semibold text-teal-900 mb-1">The One Thing</div>
                      <div className="text-sm text-teal-700">
                        Finalize brand proposal for Acme Corp
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Status: In Progress
                    </div>
                  </div>
                </div>

                {/* Right Side - Aimy */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 mr-3"></div>
                    <div>
                      <div className="font-bold text-gray-900">Aimy</div>
                      <div className="text-sm text-gray-500">Handling Everything Else</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>✓ Following up with John about timeline</div>
                    <div>✓ Tracking 3 pending approvals</div>
                    <div>✓ Reminder scheduled for Friday</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 text-center">
              <p className="text-gray-700 text-lg">
                <strong>You stay focused.</strong> Aimy keeps everything running smoothly.
              </p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center mb-20">
          <p className="text-gray-600 text-lg mb-8">
            Trusted by creative professionals who refuse to drop the ball
          </p>
          <div className="flex justify-center items-center space-x-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 border-2 border-white"
                ></div>
              ))}
            </div>
            <span className="text-gray-600 ml-4">50+ on the waitlist</span>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl shadow-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to stay in flow?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join the waitlist for early access and founding member pricing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white text-teal-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Join Early Access →
            </button>
            <a
              href="/app"
              className="bg-teal-700 text-white font-semibold px-8 py-4 rounded-lg hover:bg-teal-800 transition-all transform hover:scale-105 shadow-lg text-center"
            >
              Try Demo (No Login) →
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2025 OkAimy. We respect your privacy. No spam, ever.</p>
          <p className="mt-2">
            Questions? Email us at{' '}
            <a href="mailto:hello@okaimy.com" className="text-teal-600 hover:text-teal-700">
              hello@okaimy.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
