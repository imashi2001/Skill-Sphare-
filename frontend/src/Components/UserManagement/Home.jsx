import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Smile, Users, BookOpen, Camera, Music, BarChart2, Cpu, Layers, Award } from "lucide-react";
import laying from "../../assets/Float.png";
import studying from "../../assets/Studying.png";

const companies = [
  { name: "asana", logo: "https://cdn.worldvectorlogo.com/logos/asana-1.svg", bg: "bg-pink-100" },
  { name: "slack", logo: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg", bg: "bg-purple-100" },
  { name: "hubspot", logo: "https://cdn.worldvectorlogo.com/logos/hubspot-1.svg", bg: "bg-orange-100" },
  { name: "monday", logo: "https://cdn.worldvectorlogo.com/logos/monday-1.svg", bg: "bg-green-100" },
];

const categories = [
  { icon: <BarChart2 className="w-7 h-7 text-blue-800" />, title: "Digital Marketing", courses: 65 },
  { icon: <Smile className="w-7 h-7 text-blue-800" />, title: "UI/UX Design", courses: 75, active: true },
  { icon: <Cpu className="w-7 h-7 text-blue-800" />, title: "IT & Software", courses: 60 },
  { icon: <BookOpen className="w-7 h-7 text-blue-800" />, title: "Data Science", courses: 67 },
  { icon: <Layers className="w-7 h-7 text-blue-800" />, title: "Computer Science", courses: 52 },
  { icon: <BarChart2 className="w-7 h-7 text-blue-800" />, title: "Finances", courses: 78 },
  { icon: <Music className="w-7 h-7 text-blue-800" />, title: "Music Production", courses: 60 },
  { icon: <Camera className="w-7 h-7 text-blue-800" />, title: "Photography", courses: 45 },
];

export default function Home() {
  const navigate = useNavigate();

  const handleGroupClick = () => {
    navigate('/groups');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ecedee]">
      {/* Header Section */}
      <section className="bg-[#edf2fd] pt-8 pb-16 flex-1">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 px-4">
          {/* Left */}
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl md:text-5xl font-extrabold text-[#18181b] mb-4 leading-tight"
            >
             Empower Your Skills, Share Your Knowledge
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-gray-500 mb-6 max-w-lg"
            >
             Discover courses, share your expertise, and collaborate with others to expand your skillset <br/> Join a thriving community of knowledge seekers and elevate your learning journey.
            </motion.p>
            <button
              onClick={() => navigate("/TaskCorner")}
              className="bg-blue-500 text-white px-4 py-2 rounded-full shadow hover:bg-blue-600"
            >
              Go to Task Corner
            </button>
            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="flex items-center bg-white rounded-full shadow px-4 py-2 w-full max-w-md"
            >
              <input
                type="text"
                placeholder="What do you want to learn today?"
                className="flex-1 bg-transparent outline-none text-gray-700"
              />
              <button className="ml-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full p-2 transition">
                <Search className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
          {/* Right */}
          <div className="flex-1 flex flex-col gap-4 items-center md:items-stretch">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Left image and avatars */}
              <div className="flex flex-col gap-4">
                {/* Top-left image with yellow bg and cut top-right corner */}
                <div className="relative">
                  <motion.img
                    src={studying}
                    alt="studying"
                    className="w-64 h-80 object-cover rounded-2xl"
                    style={{
                      clipPath: "polygon(0 0, 90% 0, 100% 10%, 100% 100%, 0 100%)",
                      background: "#FFD34E"
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  />
                  {/* Optional: grid dots decoration */}
                 
                </div>
                {/* Avatars and badge */}
                <div className="relative">
                  {/* Grid dots decoration */}
                  <div className="absolute -top-6 -left-6 grid grid-cols-4 gap-1 opacity-70">
                    {[...Array(16)].map((_, i) => (
                      <span key={i} className="w-2 h-2 bg-blue-800 rounded-full" />
                    ))}
                  </div>
                  {/* Avatars and badge box with green offset shadow */}
                  <div className="relative inline-flex items-center bg-white rounded-2xl px-5 py-2 shadow-md"
                    style={{ boxShadow: '4px 4px 0 0 #194a7a' }}>
                    <div className="flex -space-x-3">
                      <img src="https://randomuser.me/api/portraits/men/11.jpg" alt="avatar" className="w-10 h-10 rounded-full border-2 border-white" />
                      <img src="https://randomuser.me/api/portraits/men/12.jpg" alt="avatar" className="w-10 h-10 rounded-full border-2 border-white" />
                      <img src="https://randomuser.me/api/portraits/women/13.jpg" alt="avatar" className="w-10 h-10 rounded-full border-2 border-white" />
                      <img src="https://randomuser.me/api/portraits/women/14.jpg" alt="avatar" className="w-10 h-10 rounded-full border-2 border-white" />
                    </div>
                    <span className="ml-4 bg-[#ff6186] text-white text-base font-bold px-2 py-1 rounded-full shadow">30K</span>
                  </div>
                </div>
              </div>
              {/* Right image and notification */}
              <div className="flex flex-col gap-4">
                {/* Notification card */}
                <div className="relative">
                  <div className="bg-white rounded-lg shadow px-6 py-3 flex flex-col items-start border-r-4 border-b-4 border-blue-800 min-w-[240px]">
                    <span className="text-base font-bold text-[#ff6361] mb-1">Congrats!</span>
                    <span className="text-sm text-gray-700">You unlocked a new badge</span>
                  </div>
                  {/* Optional: floating badge or icon */}
                  <div className="absolute -top-4 -left-4 bg-[#d7cdfe] rounded-full p-2 shadow">
                    <Award className="text-[#7b6992] w-4 h-4" />
                  </div>
                </div>
                {/* Right image with green bg and cut top-right corner */}
                <div className="mt-10 w-56">
                  <motion.img
                    src={laying}
                    alt="laying"
                    className="w-80 h-64 object-cover rounded-2xl"
                    style={{
                      clipPath: "polygon(0 0, 90% 0, 100% 10%, 100% 100%, 0 100%)",
                      background: "#4c956c"
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="py-12 bg-white">
        {/* Trusted Companies */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8">
          {companies.map((company) => (
            <motion.img
              key={company.name}
              src={company.logo}
              alt={company.name}
              className="h-8 object-contain transition"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>
      </section>
      
        <div className="max-w-7xl mx-auto px-4 mt-10">
          <div className="text-center mb-2 text-sm text-[#182d83] font-semibold">Top Categories</div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">Popular Topics To Discover</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.title}
                className={
                  `relative rounded-2xl bg-white p-8 flex flex-col items-center shadow-md border border-gray-100 transition-all duration-200 ` +
                  `hover:border-b-4 hover:border-b-blue-700 hover:border-x-0 hover:border-t-0`
                }
                style={{ boxShadow: "0 4px 24px rgba(128,128,128,0.18)" }}
                whileHover={{ scale: 1.04, transition: { duration: 0.35, ease: 'easeInOut' } }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.01, ease: 'easeInOut' }}
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ background: '#cbc8ce' }}>
                  {React.cloneElement(cat.icon, { className: 'w-8 h-8 text-blue-800' })}
                </div>
                <div className="font-bold text-lg text-gray-800 mb-1 text-center">{cat.title}</div>
                <div className="text-sm text-gray-400 text-center">{cat.courses}+ Posts</div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-center mt-14 mb-5">
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-8 py-2 rounded-full bg-blue-700 text-white font-semibold shadow hover:bg-blue-800 transition"
            >
              View All Catagories
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  );
}
