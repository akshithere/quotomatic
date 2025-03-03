import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import axios from "axios";

export default function Landing() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/quotes");
      setQuotes(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <motion.h1
        className="text-4xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Inspiring Quotes
      </motion.h1>
      
      {loading ? (
        <p className="text-lg animate-pulse">Loading quotes...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((quote) => (
            <motion.div key={quote.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="bg-gray-800 border-gray-700 shadow-lg p-4 rounded-2xl hover:scale-105 transition-transform">
                <CardContent>
                  <p className="text-lg italic">"{quote.text}"</p>
                  <p className="text-sm mt-2 text-gray-400">- {quote.author}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      <button className="mt-6 bg-blue-500 p-4 rounded-xl hover:bg-blue-600" onClick={fetchQuotes}>
        Refresh Quotes
      </button>
    </div>
  );
}
