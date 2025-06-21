import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, BarChart3, MessageSquareText, Trophy, Zap, Users, ArrowRight } from 'lucide-react'; // Lucide icons
import { motion } from 'framer-motion'; // Import motion

const featureIconSize = 40; // Consistent icon size for features

const backgroundStyle = {
  background: 'radial-gradient(circle at top left, #e0f2fe 10%, #f3e8ff 60%, #e6f7f0 100%)'
};

const FeatureCard = ({ icon, title, description, colorClass }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center text-center border-t-4 ${colorClass}`}>
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </div>
);

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div style={backgroundStyle} className="min-h-screen py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Hero Section */}
        <section className="text-center mb-16 md:mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 mb-6 leading-tight"
          >
            Welcome to Aspira
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto"
          >
            Unlock your potential, share your knowledge, and connect with a vibrant community dedicated to growth and skill enhancement.
          </motion.p>
        </section>

        {/* What is Aspira? Section */}
        <section className="mb-16 md:mb-24 bg-white p-8 md:p-10 rounded-2xl shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="md:w-1/3 flex justify-center"
            >
              <Zap size={80} className="text-blue-500" />
            </motion.div>
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">What is Aspira?</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                Aspira is more than just a platform; it's a dynamic ecosystem designed to empower individuals like you. Whether you're looking to test your skills, learn new things, share your expertise, or compete for recognition, Aspira provides the tools and community to help you achieve your aspirations.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our mission is to foster an engaging environment where learning is interactive, achievements are celebrated, and connections lead to collaborative success.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="mb-16 md:mb-24">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Explore Our Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <FeatureCard
                icon={<Gamepad2 size={featureIconSize} className="text-purple-500" />}
                title="GameHub"
                description="Challenge yourself with a variety of interactive games designed to test and sharpen your skills in different domains."
                colorClass="border-purple-500"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <FeatureCard
                icon={<BarChart3 size={featureIconSize} className="text-green-500" />}
                title="Leaderboard"
                description="See how your contributions rank! Our leaderboard showcases the most engaging posts and active community members."
                colorClass="border-green-500"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <FeatureCard
                icon={<MessageSquareText size={featureIconSize} className="text-blue-500" />}
                title="Diverse Posts"
                description="Dive into a wide array of topics. Share your insights, learn from others, and engage in meaningful discussions."
                colorClass="border-blue-500"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <FeatureCard
                icon={<Trophy size={featureIconSize} className="text-yellow-500" />}
                title="Task Corner"
                description="Create personalized learning paths, tackle tasks, and earn badges to showcase your accomplishments and track your progress."
                colorClass="border-yellow-500"
              />
            </motion.div>
          </div>
        </section>

        {/* Join Our Community Section */}
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-12 md:py-16 rounded-2xl shadow-xl text-center">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, amount: 0.5 }}
             transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Users size={60} className="mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Thriving Community!</h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Become a part of Aspira today. Share, learn, engage, and grow with us. Your journey to excellence starts here.
            </p>
            <button
              onClick={() => navigate('/')} // Assuming '/' is the AuthPage or signup page
              className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-300 text-lg flex items-center justify-center mx-auto group"
            >
              Get Started <ArrowRight size={22} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </section>

      </div>
    </div>
  );
};

// Need to import motion from framer-motion
// To use motion, wrap the component with <motion.div> or similar
// Example: import { motion } from 'framer-motion';

export default AboutUs; 