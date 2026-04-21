import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Navbar from "../components/Navbar";

export default function Chat() {
    const { authUser, isAuthenticated } = useAuth();
    const { socket, isOnline } = useSocket();
    const location = useLocation();
    
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Fetch conversations list on mount
    useEffect(() => {
        const fetchConvos = async () => {
            try {
                const res = await api.get("/chat/conversations");
                if (res.data.success) {
                    let fetchedConvos = res.data.conversations;
                    
                    if (location.state?.user) {
                        const targetUser = location.state.user;
                        const exists = fetchedConvos.find(c => c.user._id === targetUser._id);
                        if (!exists) {
                            fetchedConvos = [{ user: targetUser, lastMessage: null, unread: false }, ...fetchedConvos];
                        }
                        setActiveChat(targetUser);
                        window.history.replaceState({}, document.title); // clear state
                    }
                    
                    setConversations(fetchedConvos);
                }
            } catch (err) {
                console.error("Failed to fetch conversations", err);
            }
        };
        fetchConvos();
    }, [location.state]);

    // Socket Event: Message Receive
    useEffect(() => {
        if (!socket) return;
        
        const handleReceive = (message) => {
            if (activeChat && (message.sender === activeChat._id || message.receiver === activeChat._id)) {
                setMessages(prev => [...prev, message]);
            }
            // Update conversation list logic to bump the latest message
            setConversations(prev => {
                const existingIndex = prev.findIndex(c => c.user._id === message.sender || c.user._id === message.receiver);
                if (existingIndex > -1) {
                    const updated = [...prev];
                    updated[existingIndex].lastMessage = message;
                    if (message.receiver === authUser._id && (!activeChat || activeChat._id !== message.sender)) {
                        updated[existingIndex].unread = true;
                    }
                    return updated;
                }
                return prev; // Or trigger a re-fetch
            });
        };

        const handleTyping = (data) => {
            if (activeChat && data.senderId === activeChat._id) setIsTyping(true);
        };
        const handleStopTyping = (data) => {
            if (activeChat && data.senderId === activeChat._id) setIsTyping(false);
        };

        socket.on("chat:receive", handleReceive);
        socket.on("chat:typing", handleTyping);
        socket.on("chat:stop_typing", handleStopTyping);

        return () => {
            socket.off("chat:receive", handleReceive);
            socket.off("chat:typing", handleTyping);
            socket.off("chat:stop_typing", handleStopTyping);
        };
    }, [socket, activeChat, authUser._id]);

    // Fetch Messages when a chat is opened
    useEffect(() => {
        if (!activeChat) return;
        
        const fetchMessages = async () => {
            try {
                const res = await api.get(`/chat/${activeChat._id}`);
                if (res.data.success) {
                    setMessages(res.data.messages);
                    // Clear unread badge
                    setConversations(prev => prev.map(c => c.user._id === activeChat._id ? { ...c, unread: false } : c));
                }
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
        };
        fetchMessages();
        setIsTyping(false); // Reset typing status on switch
    }, [activeChat]);

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        try {
            const res = await api.post(`/chat/${activeChat._id}`, { content: newMessage });
            if (res.data.success) {
                setMessages(prev => [...prev, res.data.message]);
                setNewMessage("");
                socket?.emit("chat:stop_typing", { receiverId: activeChat._id });
            }
        } catch (err) {
            console.error("SendMessage error", err);
        }
    };

    const handleTypingInput = (e) => {
        setNewMessage(e.target.value);
        if (!socket || !activeChat) return;

        socket.emit("chat:typing", { receiverId: activeChat._id });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("chat:stop_typing", { receiverId: activeChat._id });
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white">
            <Navbar />
            <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:h-[calc(100vh-72px)] h-[calc(100vh-140px)]">
                <div className="flex flex-col sm:flex-row bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden h-full shadow-2xl">
                    
                    {/* Left Sidebar - Conversation List */}
                    <div className="w-full sm:w-[30%] border-r border-white/5 flex flex-col bg-[#0A0A0F]/50">
                        <div className="p-5 border-b border-white/5">
                            <h2 className="text-xl font-bold font-syne bg-clip-text text-transparent bg-gradient-to-r from-[#6C63FF] to-[#00D4AA]">Messages</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
                            {conversations.length === 0 ? (
                                <p className="text-white/30 text-center mt-10 text-sm">No messages yet.</p>
                            ) : (
                                conversations.map(c => (
                                    <button 
                                        key={c.user._id} 
                                        onClick={() => setActiveChat(c.user)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition ${activeChat?._id === c.user._id ? 'bg-[#6C63FF]/10 border border-[#6C63FF]/20' : 'hover:bg-white/5 border border-transparent'}`}
                                    >
                                        <div className="relative">
                                            {c.user.avatar ? (
                                                <img src={c.user.avatar} className="w-12 h-12 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center font-bold">{c.user.name.charAt(0)}</div>
                                            )}
                                            {isOnline(c.user._id) && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#111116] rounded-full"></div>}
                                        </div>
                                        <div className="flex-1 text-left overflow-hidden">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-semibold text-sm truncate text-white">{c.user.name}</h3>
                                                {c.unread && <div className="w-2 h-2 rounded-full bg-[#00D4AA]"></div>}
                                            </div>
                                            <p className={`text-xs truncate ${c.unread ? 'text-white/80 font-semibold' : 'text-white/40'}`}>
                                                {c.lastMessage?.content || "Tap to chat"}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Chat Area */}
                    <div className="flex-1 flex flex-col bg-[#0A0A0F]/20 relative max-h-full">
                        {activeChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-[#111116]/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                                    {activeChat.avatar ? (
                                        <img src={activeChat.avatar} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center font-bold text-sm">{activeChat.name.charAt(0)}</div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-[15px]">{activeChat.name}</h3>
                                        <p className="text-[11px] text-white/40">{isOnline(activeChat._id) ? "Online" : "Offline"}</p>
                                    </div>
                                </div>

                                {/* Messages View */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                    {messages.map(msg => {
                                        const isMine = msg.sender === authUser._id;
                                        return (
                                            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                                <div className={`max-w-[80%] sm:max-w-[70%] p-3 px-4 rounded-2xl text-[14px] leading-relaxed shadow-lg ${isMine ? 'bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] text-white rounded-tr-sm' : 'bg-[#1A1A24] text-white/90 border border-white/5 rounded-tl-sm'}`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {isTyping && (
                                        <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                                            <div className="bg-[#1A1A24] border border-white/5 p-3 px-4 rounded-2xl rounded-tl-sm flex gap-1 items-center h-10">
                                                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 border-t border-white/5 bg-[#111116]/80 backdrop-blur-md shrink-0">
                                    <form onSubmit={handleSend} className="flex gap-2 items-center">
                                        <input 
                                            type="text" 
                                            value={newMessage}
                                            onChange={handleTypingInput}
                                            placeholder="Write a message..."
                                            className="flex-1 bg-[#0A0A0F] border border-white/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#6C63FF] transition shadow-inner"
                                        />
                                        <button type="submit" disabled={!newMessage.trim()} className="p-3 bg-[#6C63FF] hover:bg-[#5b54d6] disabled:opacity-50 disabled:hover:bg-[#6C63FF] rounded-full text-white transition shadow-lg shadow-[#6C63FF]/20">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-white/20 hidden sm:flex">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-white/10"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                <p className="text-lg font-syne font-semibold text-white/40">Your Messages</p>
                                <p className="text-sm">Select a conversation to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
