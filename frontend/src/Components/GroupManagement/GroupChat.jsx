import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../config/axios';
import { PaperAirplaneIcon, UserCircleIcon, ArrowDownCircleIcon, UsersIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';

const GroupChat = () => {
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);

  // Dummy current user for demo; replace with real user info
  const currentUser = { name: 'You', id: 1 };

  // Fetch group name (optional, if available)
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await axios.get(`/api/groups/${groupId}`);
        setGroupName(response.data.name || 'Group Chat');
      } catch {
        setGroupName('Group Chat');
      }
    };
    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/groups/${groupId}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`/api/groups/${groupId}/members`);
        setMembers(response.data);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };
    fetchMessages();
    fetchMembers();
  }, [groupId]);

  // Scroll to bottom logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detect if user is at the bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      setAtBottom(scrollHeight - scrollTop - clientHeight < 10);
    };
    const ref = messagesContainerRef.current;
    if (ref) ref.addEventListener('scroll', handleScroll);
    return () => {
      if (ref) ref.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const response = await axios.post(`/api/groups/${groupId}/messages`, {
        content: newMessage,
      });
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  // Helper for avatar fallback
  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?';

  // Parse content if it's a JSON string
  const getMessageContent = (content) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.content === 'string') return parsed.content;
      return content;
    } catch {
      return content;
    }
  };

  // Leave group handler (placeholder)
  const handleLeaveGroup = () => {
    alert('Leave group functionality coming soon!');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-2">
      {/* Members Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 rounded-l-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
          <UsersIcon className="h-6 w-6" />
          <span className="font-semibold text-lg">Members</span>
          <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">{members.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-white">
          {members.map((member) => (
            <div key={member.id || member.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-indigo-50 transition">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                {getInitials(member.name || member.username)}
              </div>
              <span className="text-sm text-gray-800 font-medium">{member.name || member.username}</span>
            </div>
          ))}
          {members.length === 0 && <div className="text-gray-400 text-center mt-8">No members</div>}
        </div>
      </aside>
      {/* Chat Main Area */}
      <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto h-[80vh] rounded-2xl shadow-2xl bg-white border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow relative">
          <UserCircleIcon className="h-8 w-8 text-white/80" />
          <h2 className="text-xl font-bold tracking-tight">{groupName}</h2>
          <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">{members.length} members</span>
          <button
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
            onClick={handleLeaveGroup}
            title="Leave Group"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" /> Leave
          </button>
        </div>
        {/* Message Count */}
        <div className="px-6 py-2 bg-gray-50 border-b text-gray-500 text-sm flex items-center gap-2">
          <span className="font-semibold">{messages.length}</span> messages
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-white relative" ref={messagesContainerRef}>
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">No messages yet. Start the conversation!</div>
          )}
          {messages.map((msg, idx) => {
            const isSelf = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id || idx}
                className={`flex items-end ${isSelf ? 'justify-end' : 'justify-start'}`}
              >
                {!isSelf && (
                  <div className="flex-shrink-0 mr-2">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                      {getInitials(msg.senderName)}
                    </div>
                  </div>
                )}
                <div className={`relative max-w-[70%] px-5 py-3 rounded-2xl shadow-md ${isSelf ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
                  <div className="font-semibold text-xs mb-1">{isSelf ? 'You' : msg.senderName}</div>
                  <div className="break-words text-base">{getMessageContent(msg.content)}</div>
                  <span className="absolute bottom-1 right-4 text-xs text-gray-400 select-none" title={formatTimestamp(msg.sentAt)}>
                    {formatTimestamp(msg.sentAt)}
                  </span>
                </div>
                {isSelf && (
                  <div className="flex-shrink-0 ml-2">
                    <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                      {getInitials(currentUser.name)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
          {/* Scroll to Bottom Button */}
          {!atBottom && (
            <button
              className="fixed bottom-24 right-8 z-10 p-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg transition flex items-center gap-1"
              onClick={scrollToBottom}
              title="Scroll to latest message"
            >
              <ArrowDownCircleIcon className="h-6 w-6" />
            </button>
          )}
        </div>
        {/* Input */}
        <form onSubmit={handleSendMessage} className="px-6 py-4 bg-gray-50 border-t flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-800 shadow-sm text-base"
            autoComplete="off"
          />
          <button
            type="submit"
            className="p-3 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow transition-colors duration-150"
            title="Send"
          >
            <PaperAirplaneIcon className="h-6 w-6 rotate-90" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupChat;
