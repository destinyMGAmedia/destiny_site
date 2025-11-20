import { useState, useEffect } from "react";
import { FaEye, FaCommentDots, FaPaperPlane } from "react-icons/fa";

function Live() {
  const [showPastSermons, setShowPastSermons] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [viewerCount, setViewerCount] = useState(null);

  // YouTube Live Stream ID - replace with actual live stream ID
  const LIVE_STREAM_ID = "LIVE_STREAM_ID";
  const videoUrl = `https://www.youtube.com/embed/${LIVE_STREAM_ID}?autoplay=1&mute=0&rel=0&modestbranding=1`;
  const chatUrl = `https://www.youtube.com/live_chat?v=${LIVE_STREAM_ID}&embed_domain=${window.location.hostname}`;

  useEffect(() => {
    // Simulate viewer count - replace with actual API call
    const interval = setInterval(() => {
      setViewerCount(Math.floor(Math.random() * 1000) + 100);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-900 to-pink-600 text-white py-32 mb-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
            Live Service
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Join us for our live worship services and experience the presence of God
          </p>
        </div>
      </div>
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* VIDEO SECTION */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-serif font-bold text-primary-900 mb-2">
              Sunday Service – Loading...
            </h2>
            <h2 className="text-xl text-gray-600 mb-4">Next Stream – Date</h2>

            {viewerCount && (
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <FaEye className="text-primary-900" />
                <span>{viewerCount} viewers watching</span>
              </div>
            )}

            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-2xl mb-6">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={videoUrl}
                title="DMGA Live Stream"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Mobile Chat FAB */}
            <button
              onClick={() => setShowChat(true)}
              className="lg:hidden fixed bottom-6 right-6 bg-primary-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-40 hover:bg-primary-800 transition-colors"
            >
              <FaCommentDots />
              <span>Chat</span>
            </button>

            {/* Offline Countdown */}
            <div className="text-center mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-lg text-pink-600">
                Next Service: <strong>Sunday 9:00 AM WAT</strong>
              </p>
            </div>

            {/* Past Sermons Toggle */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">Missed a service?</p>
              <button
                onClick={() => setShowPastSermons(!showPastSermons)}
                className="px-6 py-2 bg-secondary-500 text-white rounded-lg font-semibold hover:bg-secondary-600 transition-colors"
              >
                {showPastSermons ? "Hide Past Sermons" : "Watch Past Sermons"}
              </button>
            </div>

            {showPastSermons && (
              <section className="mt-8">
                <h3 className="text-2xl font-serif font-bold text-primary-900 mb-6">
                  Past Sermons
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Past sermon cards would go here */}
                  <p className="text-gray-600">
                    Past sermons will be displayed here
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* CHAT PANEL (Desktop) */}
          <aside className="hidden lg:block">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-24">
              <h3 className="text-xl font-serif font-bold text-primary-900 mb-4">
                Live Chat
              </h3>
              <div className="relative pb-[600px] h-0 overflow-hidden rounded-lg">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={chatUrl}
                  frameBorder="0"
                  title="Live Chat"
                ></iframe>
              </div>
            </div>
          </aside>
        </div>

        {/* SERVICE TIMES */}
        <section className="mt-12 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-serif font-bold text-primary-900 mb-6">
              Regular Service Times
            </h3>
            <ul className="space-y-3 text-lg">
              <li>
                <strong>Sunday:</strong> 9:00 AM & 11:30 AM WAT
              </li>
              <li>
                <strong>Thursday:</strong> 5:00 PM (Bible Study)
              </li>
            </ul>
          </div>
        </section>
      </div>

      {/* MOBILE CHAT BOTTOM SHEET */}
      {showChat && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full h-[80vh] rounded-t-3xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-lg font-semibold text-primary-900">
                Live Chat
              </span>
              <button
                onClick={() => setShowChat(false)}
                className="text-2xl text-gray-600 hover:text-gray-900"
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                className="w-full h-full"
                src={chatUrl}
                frameBorder="0"
                title="Live Chat"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Live;
