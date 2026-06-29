import React, { useState, useEffect, useRef } from 'react';
import { Show, SignIn, UserButton, SignOutButton, useUser } from "@clerk/react";
import './index.css';
import InteractiveDots from './InteractiveDots';

// Dynamically determine the API base URL based on how the app is accessed
const getApiUrl = () => {
  const hostname = window.location.hostname || 'localhost';
  return 'https://tasky-production-bd2a.up.railway.app/api/todos';
};

// Reusable Scrambled Text Component
function ScrambledText({ text }) {
  const [iteration, setIteration] = useState(0);
  const [scrambleChars, setScrambleChars] = useState([]);
  const chars = "$%&?#@+*<>[]{}/\\|~_-=10";

  useEffect(() => {
    setIteration(0);
  }, [text]);

  useEffect(() => {
    if (iteration >= text.length) return;

    const speed = 25; 
    const increment = 0.45;

    const interval = setInterval(() => {
      const newScramble = text.split("").map(() => chars[Math.floor(Math.random() * chars.length)]);
      setScrambleChars(newScramble);
      
      setIteration(prev => {
        const next = prev + increment;
        if (next >= text.length) {
          clearInterval(interval);
          return text.length;
        }
        return next;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [text, iteration]);

  if (iteration >= text.length) {
    return <>{text}</>;
  }

  return (
    <>
      {text.split("").map((char, index) => {
        if (char === " ") return " ";
        if (index < iteration) {
          return <span key={index}>{text[index]}</span>;
        }
        return (
          <span key={index} style={{ color: '#7a7a7a' }} className="scrambling-char">
            {scrambleChars[index] || chars[0]}
          </span>
        );
      })}
    </>
  );
}

// Scrambled Title Component
function ScrambledTitle() {
  const originalText = "TASKY";
  const [iteration, setIteration] = useState(0);
  const [scrambleChars, setScrambleChars] = useState([]);
  const chars = "$%&?#@+*<>[]{}/\\|~_-=10";

  const triggerScramble = () => {
    setIteration(0);
  };

  useEffect(() => {
    if (iteration >= originalText.length) return;

    const speed = 30;
    const increment = 0.35;

    const interval = setInterval(() => {
      const newScramble = originalText.split("").map(() => chars[Math.floor(Math.random() * chars.length)]);
      setScrambleChars(newScramble);
      
      setIteration(prev => {
        const next = prev + increment;
        if (next >= originalText.length) {
          clearInterval(interval);
          return originalText.length;
        }
        return next;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [iteration]);

  useEffect(() => {
    triggerScramble();
  }, []);

  return (
    <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 8px rgba(197, 168, 92, 0.6))', flexShrink: 0 }}>
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5e6c4" />
            <stop offset="50%" stopColor="#c5a85c" />
            <stop offset="100%" stopColor="#f9e7b9" />
          </linearGradient>
        </defs>
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
      </svg>
      <h1 
        className="app-title scrambled-text" 
        onMouseEnter={triggerScramble}
        id="app-title-scrambler"
        title="Hover to scramble"
      >
        {iteration >= originalText.length ? (
          originalText
        ) : (
          originalText.split("").map((char, index) => {
            if (index < iteration) {
              return <span key={index}>{originalText[index]}</span>;
            }
            return (
              <span key={index} style={{ color: '#7a7a7a' }}>
                {scrambleChars[index] || chars[0]}
              </span>
            );
          })
        )}
      </h1>
    </div>
  );
}

// Custom iOS-style Neumorphic Scroll Wheel Component
function ScrollWheel({ items, selectedValue, onChange }) {
  const containerRef = useRef(null);
  const itemHeight = 40; 

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const index = items.indexOf(selectedValue);
    if (index !== -1) {
      const targetScroll = index * itemHeight;
      if (Math.abs(container.scrollTop - targetScroll) > 1) {
        container.scrollTop = targetScroll;
      }
    }
  }, [selectedValue, items]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const scrollPos = container.scrollTop;
    const index = Math.round(scrollPos / itemHeight);
    if (index >= 0 && index < items.length) {
      const val = items[index];
      if (val !== selectedValue) {
        onChange(val);
      }
    }
  };

  return (
    <div className="wheel-container">
      <div className="wheel-selection-line"></div>
      <div 
        ref={containerRef} 
        className="wheel-scroll"
        onScroll={handleScroll}
      >
        <div className="wheel-spacer" style={{ height: `${itemHeight}px` }}></div>
        {items.map((item, index) => (
          <div 
            key={index} 
            className={`wheel-item ${item === selectedValue ? 'selected' : ''}`}
            style={{ height: `${itemHeight}px`, lineHeight: `${itemHeight}px` }}
          >
            {item}
          </div>
        ))}
        <div className="wheel-spacer" style={{ height: `${itemHeight}px` }}></div>
      </div>
    </div>
  );
}

// Dark Golden Custom Neumorphic Scroll Picker Modal
function CustomDateTimePickerModal({ initialValue, onSave, onClose }) {
  const parseInitial = () => {
    const d = initialValue ? new Date(initialValue) : new Date();
    const hr = d.getHours();
    const isPm = hr >= 12;
    const hr12 = hr % 12 === 0 ? 12 : hr % 12;
    const minStr = String(Math.round(d.getMinutes() / 5) * 5 % 60).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return {
      month: monthNames[d.getMonth()],
      day: d.getDate(),
      hour: hr12,
      minute: minStr,
      ampm: isPm ? 'PM' : 'AM'
    };
  };

  const init = parseInitial();
  const [month, setMonth] = useState(init.month);
  const [day, setDay] = useState(init.day);
  const [hour, setHour] = useState(init.hour);
  const [minute, setMinute] = useState(init.minute);
  const [ampm, setAmpm] = useState(init.ampm);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
  const ampms = ["AM", "PM"];

  const handleSave = () => {
    const now = new Date();
    const monthIndex = months.indexOf(month);
    const yr = now.getFullYear();
    
    let hr24 = parseInt(hour);
    if (ampm === 'PM' && hr24 < 12) hr24 += 12;
    if (ampm === 'AM' && hr24 === 12) hr24 = 0;

    const finalDate = new Date(yr, monthIndex, parseInt(day), hr24, parseInt(minute));
    onSave(finalDate.toISOString());
  };

  return (
    <div className="neumorphic-modal-overlay">
      <div className="neumorphic-modal animate-slide-down">
        <h2 className="modal-title">Configure Due Date</h2>
        
        <div className="pickers-grid">
          <div className="picker-section">
            <h3 className="section-label">Date Selector</h3>
            <div className="wheels-row">
              <ScrollWheel items={months} selectedValue={month} onChange={setMonth} />
              <ScrollWheel items={days} selectedValue={day} onChange={setDay} />
            </div>
          </div>

          <div className="picker-section">
            <h3 className="section-label">Time Selector</h3>
            <div className="wheels-row">
              <ScrollWheel items={hours} selectedValue={hour} onChange={setHour} />
              <ScrollWheel items={minutes} selectedValue={minute} onChange={setMinute} />
              <ScrollWheel items={ampms} selectedValue={ampm} onChange={setAmpm} />
            </div>
          </div>
        </div>

        <div className="modal-actions-row">
          <button type="button" className="neumorphic-btn-action reset-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="neumorphic-btn-action save-btn" onClick={handleSave}>
            Set Date
          </button>
        </div>
      </div>
    </div>
  );
}

function ClerkLoginModal({ onClose }) {
  useEffect(() => {
    const hideDevMode = () => {
      const elements = document.querySelectorAll('div, span, a, p');
      elements.forEach(el => {
        if (el.textContent && (el.textContent.trim().toLowerCase() === 'development mode' || el.textContent.trim().toLowerCase() === 'secured by clerk')) {
          el.style.display = 'none';
          if (el.parentElement) {
            el.parentElement.style.display = 'none';
            el.parentElement.style.opacity = '0';
          }
          if (el.parentElement && el.parentElement.parentElement) {
             // In case it's nested deep
             el.parentElement.parentElement.style.display = 'none';
          }
        }
      });
    };
    hideDevMode();
    const interval = setInterval(hideDevMode, 50);
    setTimeout(() => clearInterval(interval), 5000); // Stop polling after 5s to save CPU
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="login-overlay" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, pointerEvents: 'none' }}>
        <InteractiveDots backgroundColor="transparent" dotColor="#c5a85c" />
      </div>
      <div className="login-card noise-texture" style={{ position: 'relative', overflow: 'hidden', padding: '1.5rem 2rem 0.5rem 2rem', display: 'flex', justifyContent: 'center', borderRadius: '16px', border: '1px solid rgba(197, 168, 92, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#a0a0a0', fontSize: '2rem', cursor: 'pointer', zIndex: 10, lineHeight: 1 }}>&times;</button>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.15, pointerEvents: 'none' }}>
          <filter id="loginNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.3 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#loginNoise)" />
        </svg>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', width: '100%', animation: 'fadeIn 0.6s ease-out' }}>
          <SignIn routing="hash" appearance={{ 
            variables: { 
              colorBackground: 'transparent', 
              colorText: 'white', 
              colorPrimary: '#c5a85c', 
              colorTextSecondary: '#a0a0a0', 
              colorInputBackground: 'rgba(0,0,0,0.4)', 
              colorInputText: 'white',
              borderRadius: '12px'
            },
            elements: { 
              badge: { display: 'none' },
              cardBox: {
                boxShadow: 'none',
                background: 'transparent',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%'
              },
              card: { 
                boxShadow: 'none', 
                background: 'transparent',
                width: '100%',
                margin: '0 auto'
              }, 
              header: { display: 'none' },
              headerTitle: { display: 'none' }, 
              headerSubtitle: { display: 'none' },
              socialButtonsBlockButton: { 
                border: '2px solid rgba(197, 168, 92, 0.6)', 
                color: '#fff', 
                background: 'linear-gradient(90deg, rgba(197, 168, 92, 0.1), rgba(197, 168, 92, 0.2))',
                transition: 'all 0.3s ease',
                padding: '0.9rem',
                fontSize: '1.05rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                '&:hover': {
                  background: 'linear-gradient(90deg, rgba(197, 168, 92, 0.2), rgba(197, 168, 92, 0.3))',
                  borderColor: '#c5a85c',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 20px rgba(197, 168, 92, 0.3)'
                }
              },
              formFieldInput: {
                border: '1px solid rgba(197, 168, 92, 0.3)',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                outline: 'none',
                padding: '1.35rem 1rem',
                fontSize: '1.35rem',
                color: '#fff',
                width: '100%',
                boxSizing: 'border-box',
                '&:focus': {
                  border: '1px solid #c5a85c',
                  boxShadow: '0 0 15px rgba(197, 168, 92, 0.3)'
                }
              },
              formFieldLabel: {
                color: '#c5a85c',
                marginBottom: '0.4rem',
                fontSize: '0.95rem',
                fontWeight: '600'
              },
              formButtonPrimary: {
                background: 'linear-gradient(135deg, #c5a85c, #e0c879)',
                color: '#000',
                fontWeight: 'bold',
                border: 'none',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                padding: '1rem',
                fontSize: '1.1rem',
                marginTop: '0.75rem',
                width: '100%',
                boxSizing: 'border-box',
                '&:hover': {
                  background: 'linear-gradient(135deg, #e0c879, #f5df9a)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 20px rgba(197, 168, 92, 0.4)'
                }
              },
              footer: {
                background: 'transparent',
                padding: '0.5rem 0 0 0'
              },
              footerAction: {
                background: 'transparent',
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                marginTop: '0.5rem',
                paddingBottom: '0'
              },
              footerActionText: {
                color: '#a0a0a0',
                fontSize: '0.95rem'
              },
              footerActionLink: {
                color: '#c5a85c',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                '&:hover': {
                  color: '#e0c879'
                }
              },
              dividerLine: {
                background: 'rgba(197, 168, 92, 0.3)'
              },
              dividerText: {
                color: '#c5a85c',
                fontWeight: '600'
              },
              identityPreview: {
                background: 'rgba(197, 168, 92, 0.1)',
                border: '1px solid rgba(197, 168, 92, 0.3)'
              },
              identityPreviewText: {
                color: '#fff'
              },
              identityPreviewEditButtonIcon: {
                color: '#c5a85c'
              }
            }
          }} />
        </div>
      </div>
    </div>
  );
}

const Icon = ({ name, size = 16, className = '', stroke = 'currentColor' }) => {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style: { display: 'inline-block', verticalAlign: 'middle', marginRight: '6px', marginTop: '-2px' } };
  switch(name) {
    case 'today': return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
    case 'upcoming': return <svg {...props}><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
    case 'filters': return <svg {...props}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
    case 'high': return <svg {...props}><path d="M12 2L2 22h20L12 2z"></path><path d="M12 8v8"></path><line x1="12" y1="16" x2="12" y2="16"></line></svg>;
    case 'medium': return <svg {...props}><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
    case 'low': return <svg {...props}><polyline points="6 9 12 15 18 9"></polyline></svg>;
    case 'check': return <svg {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>;
    case 'empty': return <svg {...props} style={{display: 'block', margin: '0 auto 1rem'}} width="48" height="48" stroke="var(--gold-primary)"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>;
    case 'offline': return <svg {...props} stroke="var(--danger)"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
    case 'sun': return <svg {...props}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
    case 'moon': return <svg {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
    default: return null;
  }
};
function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const userName = isSignedIn ? (user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || 'User') : 'Guest';
  const userId = isSignedIn ? (user?.id) : null;
  
  const [activeTab, setActiveTab] = useState('today'); // 'today', 'upcoming', 'filters', or project category
  const [projects, setProjects] = useState(() => JSON.parse(localStorage.getItem('anti_task_projects')) || ['Project']);

  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('General');
  const [customCategory, setCustomCategory] = useState('');
  const [dueAt, setDueAt] = useState(''); 
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPickerModal, setShowPickerModal] = useState(false); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [now, setNow] = useState(new Date());
  const [isLightMode, setIsLightMode] = useState(false);

  const getGuestTodos = () => JSON.parse(localStorage.getItem('anti_task_guest_todos') || '[]');
  const saveGuestTodos = (t) => localStorage.setItem('anti_task_guest_todos', JSON.stringify(t));

  useEffect(() => {
    if (isLightMode) document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  }, [isLightMode]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const [loading, setLoading] = useState(true);

  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  
  const [filter, setFilter] = useState('all'); 
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time-desc');

  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [cursorHovered, setCursorHovered] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);

  const API_URL = getApiUrl();

  const priorityWeight = { high: 3, medium: 2, low: 1 };

  const handleAddProject = () => {
    const p = prompt("Enter project name:");
    if (p && !projects.includes(p)) {
      const newProjects = [...projects, p];
      setProjects(newProjects);
      localStorage.setItem('anti_task_projects', JSON.stringify(newProjects));
      setActiveTab(p);
    }
  };

  const fetchTodos = async () => {
    setLoading(true);
    try {
      if (!isSignedIn) {
        setTodos(getGuestTodos());
        setIsOnline(true);
      } else {
        const response = await fetch(API_URL, {
          headers: { 'X-User-Id': userId }
        });
        if (!response.ok) throw new Error('Failed to fetch tasks.');
        const data = await response.json();
        setTodos(data);
        setIsOnline(true);
      }
    } catch (err) {
      console.error('API connection error:', err);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
    if (isSignedIn && userId) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(API_URL, { headers: { 'X-User-Id': userId } });
          setIsOnline(response.ok);
        } catch (err) {
          setIsOnline(false);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn, userId]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!cursorVisible) setCursorVisible(true);
    };

    const handleMouseLeave = () => setCursorVisible(false);

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = 
        target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'INPUT' || 
        target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || 
        target.closest('.todo-card') || target.closest('.custom-checkbox') ||
        target.closest('.filter-btn') || target.closest('.neumorphic-trigger-btn') ||
        target.closest('.neumorphic-clear-trigger-btn') || target.closest('.neumorphic-btn-action') ||
        target.closest('.wheel-scroll') || target.closest('.nav-item');
      setCursorHovered(!!isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorVisible]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalCategory = category;
    if (category === 'custom') finalCategory = customCategory.trim() || 'General';
    else if (activeTab !== 'today' && activeTab !== 'upcoming' && activeTab !== 'filters') {
      finalCategory = activeTab;
    }

    try {
      if (!isSignedIn) {
        const newTodo = {
          id: Date.now(),
          title: title.trim(),
          description: description.trim(),
          priority: priority,
          category: finalCategory,
          due_at: dueAt || null,
          completed: false,
          created_at: new Date().toISOString()
        };
        const guestTodos = getGuestTodos();
        saveGuestTodos([newTodo, ...guestTodos]);
        setTodos([newTodo, ...todos]);
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': userId 
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            priority: priority,
            category: finalCategory,
            due_at: dueAt || null
          }),
        });

        if (!response.ok) throw new Error('Failed to create task');
        const newTodo = await response.json();
        setTodos([newTodo, ...todos]);
      }
      
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('General');
      setCustomCategory('');
      setDueAt(''); 
      setShowAddForm(false);
    } catch (err) {
      alert('Error creating task: ' + err.message);
    }
  };

  const startEditing = (todo) => {
    setEditingTodoId(todo.id);
    setEditTitle(todo.title);
    setEditDesc(todo.description || '');
  };

  const saveEditing = async (todo) => {
    if (!editTitle.trim()) return;
    try {
      if (!isSignedIn) {
        const guestTodos = getGuestTodos();
        const updated = guestTodos.map(t => t.id === todo.id ? { ...t, title: editTitle.trim(), description: editDesc.trim() } : t);
        saveGuestTodos(updated);
        setTodos(updated);
      } else {
        const response = await fetch(`${API_URL}/${todo.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify({ 
            title: editTitle.trim(), 
            description: editDesc.trim(),
            completed: todo.completed,
            priority: todo.priority,
            category: todo.category,
            due_at: todo.due_at
          }),
        });
        if (!response.ok) throw new Error('Failed to update task');
        const updatedTodo = await response.json();
        setTodos(todos.map(t => t.id === todo.id ? updatedTodo : t));
      }
      setEditingTodoId(null);
    } catch (err) {
      alert('Error updating task: ' + err.message);
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      if (!isSignedIn) {
        const guestTodos = getGuestTodos();
        const updated = guestTodos.map(t => t.id === todo.id ? { ...t, completed: !todo.completed } : t);
        saveGuestTodos(updated);
        setTodos(updated);
      } else {
        const response = await fetch(`${API_URL}/${todo.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': userId
          },
          body: JSON.stringify({ completed: !todo.completed }),
        });

        if (!response.ok) throw new Error('Failed to update task');
        const updatedTodo = await response.json();
        setTodos(todos.map(t => t.id === todo.id ? updatedTodo : t));
      }
    } catch (err) {
      alert('Error updating task: ' + err.message);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      if (!isSignedIn) {
        const guestTodos = getGuestTodos();
        const updated = guestTodos.filter(t => t.id !== id);
        saveGuestTodos(updated);
        setTodos(updated);
      } else {
        const response = await fetch(`${API_URL}/${id}`, { 
          method: 'DELETE',
          headers: { 'X-User-Id': userId }
        });
        if (!response.ok) throw new Error('Failed to delete task');
        setTodos(todos.filter(t => t.id !== id));
      }
    } catch (err) {
      alert('Error deleting task: ' + err.message);
    }
  };

  const handleCardMouseMove = (e, todo) => {
    if (todo.completed) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const tiltX = (y - yc) / yc; 
    const tiltY = (x - xc) / xc; 
    const maxRotationDegrees = 1.5; 
    const rotateX = -(tiltX * maxRotationDegrees);
    const rotateY = tiltY * maxRotationDegrees;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.005, 1.005, 1.005)`;
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  const categoriesList = ['all', ...new Set(todos.map(t => t.category || 'General'))];

  const filteredTodos = todos.filter(todo => {
    let matchTab = true;
    const now = new Date();
    const todayStr = now.toDateString();

    if (activeTab === 'today') {
      matchTab = !todo.due_at || new Date(todo.due_at).toDateString() === todayStr || (new Date(todo.due_at) < now && !todo.completed);
    } else if (activeTab === 'upcoming') {
      matchTab = todo.due_at && new Date(todo.due_at) > now && new Date(todo.due_at).toDateString() !== todayStr;
    } else if (activeTab === 'filters') {
      matchTab = true;
    } else {
      matchTab = todo.category === activeTab;
    }

    const matchStatus = filter === 'all' || (filter === 'active' && !todo.completed) || (filter === 'completed' && todo.completed);
    const matchCategory = (activeTab !== 'filters') ? true : (categoryFilter === 'all' || todo.category === categoryFilter);

    return matchTab && matchStatus && matchCategory;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === 'time-desc') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'time-asc') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'name-asc') return a.title.localeCompare(b.title);
    if (sortBy === 'name-desc') return b.title.localeCompare(a.title);
    if (sortBy === 'importance-desc') return priorityWeight[b.priority] - priorityWeight[a.priority];
    if (sortBy === 'importance-asc') return priorityWeight[a.priority] - priorityWeight[b.priority];
    return 0;
  });

  const completedTasks = sortedTodos.filter(t => t.completed);
  const pendingHigh = sortedTodos.filter(t => !t.completed && t.priority === 'high');
  const pendingMedium = sortedTodos.filter(t => !t.completed && t.priority === 'medium');
  const pendingLow = sortedTodos.filter(t => !t.completed && t.priority === 'low');

  const renderTodoCard = (todo) => {
    const isOverdue = todo.due_at && new Date(todo.due_at) < now && !todo.completed;
    
    let countdownVisual = null;
    let percentageLeft = 0;
    if (todo.due_at && !todo.completed) {
      const diffMs = new Date(todo.due_at) - now;
      
      const dueMs = new Date(todo.due_at).getTime();
      const createdMs = new Date(todo.created_at).getTime();
      const nowMs = now.getTime();
      const totalDuration = dueMs - createdMs;
      
      if (totalDuration > 0) {
        const elapsed = nowMs - createdMs;
        percentageLeft = Math.max(0, Math.min(100, 100 - (elapsed / totalDuration) * 100));
      }

      if (diffMs > 0) {
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        const pad = (num) => num.toString().padStart(2, '0');
        
        countdownVisual = (
          <div className="minimal-countdown">
            {diffDays > 0 && <span className="cd-block"><span className="cd-val">{pad(diffDays)}</span><span className="cd-lbl">d</span></span>}
            <span className="cd-block"><span className="cd-val">{pad(diffHours)}</span><span className="cd-lbl">h</span></span>
            <span className="cd-block"><span className="cd-val">{pad(diffMins)}</span><span className="cd-lbl">m</span></span>
            <span className="cd-block"><span className="cd-val">{pad(diffSecs)}</span><span className="cd-lbl">s</span></span>
          </div>
        );
      } else {
        countdownVisual = <div className="minimal-countdown"><span className="cd-block" style={{ color: '#ff5252' }}>Overdue</span></div>;
        percentageLeft = 0;
      }
    }

    return (
      <article 
        key={todo.id} 
        className={`todo-card ${todo.completed ? 'completed' : ''} priority-${todo.priority}`}
        onMouseMove={(e) => handleCardMouseMove(e, todo)}
        onMouseLeave={handleCardMouseLeave}
      >
        {!todo.completed && <div className="comet-glow-overlay" />}
        <div className="checkbox-container" onClick={() => handleToggleComplete(todo)}>
          <div className="custom-checkbox"></div>
        </div>
        
        {editingTodoId === todo.id ? (
          <div className="todo-content" style={{ paddingRight: '1rem', pointerEvents: 'auto' }}>
            <input type="text" className="input-field" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ fontSize: '1.05rem', padding: '0.5rem', marginBottom: '0.5rem' }} />
            <textarea className="textarea-field" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} style={{ minHeight: '60px', padding: '0.5rem' }} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button className="btn btn-primary" onClick={() => saveEditing(todo)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>Save</button>
              <button className="btn btn-danger-outline" onClick={() => setEditingTodoId(null)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="todo-content">
              <div className="todo-header-row">
                <h3 className="todo-title"><ScrambledText text={todo.title} /></h3>
                <div className="tags-wrapper">
                  <span className={`tag-priority priority-badge-${todo.priority}`}>
                    {todo.priority === 'high' ? 'High' : todo.priority === 'medium' ? 'Medium' : 'Low'}
                  </span>
                  <span className="tag-category">{todo.category || 'General'}</span>
                </div>
              </div>
              {todo.description && <p className="todo-desc">{todo.description}</p>}
              <div className="todo-meta">
                {`Created: ${new Date(todo.created_at).toLocaleString()}`}
              </div>
            </div>
            
            {todo.due_at && (
              <div className={`todo-due-visual ${isOverdue ? 'overdue' : ''} ${todo.completed ? 'completed' : ''}`}>
                <div className="due-visual-date">
                  {new Date(todo.due_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
                <div className="due-visual-time">
                  {new Date(todo.due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {countdownVisual && (
                  <div className="due-visual-remaining" style={{ position: 'relative', overflow: 'hidden', padding: '0.35rem' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', background: 'var(--gold-primary)', width: `${percentageLeft}%`, transition: 'width 1s linear', borderRadius: '2px' }}></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>{countdownVisual}</div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="todo-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button className="btn btn-icon" onClick={() => startEditing(todo)} title="Edit" style={{ color: 'var(--gold-primary)', border: '1px solid rgba(197, 168, 92, 0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button className="btn btn-danger-outline btn-icon" onClick={() => handleDeleteTodo(todo.id)} title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </article>
    );
  };

  return (
    <>
      <InteractiveDots backgroundColor="transparent" dotColor="#c5a85c" />

      <div className={`custom-cursor-dot ${cursorVisible ? 'visible' : ''}`} style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }} />
      <div className={`custom-cursor-ring ${cursorVisible ? 'visible' : ''} ${cursorHovered ? 'hovered' : ''}`} style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }} />

      <div className="app-container split-layout">
          {/* LEFT SIDEBAR PANEL (30%) */}
          <aside className="sidebar-panel">
            <div className="user-profile">
              {isSignedIn ? <UserButton /> : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(197, 168, 92, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5a85c', fontWeight: 'bold' }}>G</div>}
              <h3 className="user-name" style={{ marginBottom: '0.75rem' }}>{userName}</h3>
            </div>

            <button 
              className={`btn-liquid-glass ${showAddForm ? 'cancel-mode' : ''} w-100 mt-1`}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? "Cancel Add" : "Add Task"}
            </button>

            <nav className="sidebar-nav">
              <button className={`nav-item ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>
                <Icon name="today" /> Today
              </button>
              <button className={`nav-item ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
                <Icon name="upcoming" /> Upcoming
              </button>
              <button className={`nav-item ${activeTab === 'filters' ? 'active' : ''}`} onClick={() => setActiveTab('filters')}>
                <Icon name="filters" /> Filters & Labels
              </button>
            </nav>

            <div className="sidebar-projects">
              <div className="projects-header">
                <h4>Projects</h4>
                <button className="add-project-btn" onClick={handleAddProject}>+</button>
              </div>
              <div className="projects-list">
                {projects.map(p => (
                  <button key={p} className={`nav-item ${activeTab === p ? 'active' : ''}`} onClick={() => setActiveTab(p)}>
                    # {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-stats" style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--panel-border)' }}>
              {isSignedIn && (
                <div style={{ marginBottom: '1rem' }}>
                  <SignOutButton>
                    <button className="btn btn-secondary w-100" style={{ padding: '0.5rem', fontSize: '0.9rem', border: '1px solid rgba(197, 168, 92, 0.3)' }}>Log Out</button>
                  </SignOutButton>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <span>Total Tasks</span>
                <span style={{ color: 'var(--text-bold)' }}>{todos.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>Completed</span>
                <span style={{ color: 'var(--success)' }}>{todos.filter(t => t.completed).length}</span>
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN PANEL (70%) */}
          <main className="main-panel">
            <header className="main-header">
              <h2 className="view-title">
                {
                  activeTab === 'today' ? "Today's Tasks" : 
                  activeTab === 'upcoming' ? "Upcoming Tasks" :
                  activeTab === 'filters' ? "All Tasks (Filtered)" : 
                  `Project: ${activeTab}`
                }
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {!isSignedIn && (
                  <button className="btn btn-primary" onClick={() => setShowLoginModal(true)} style={{ padding: '0.55rem 1.75rem', fontSize: '0.95rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    Login
                  </button>
                )}
                <button 
                  className="btn btn-primary" 
                  onClick={() => setIsLightMode(!isLightMode)} 
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '20px' }}
                >
                  {isLightMode ? <><Icon name="moon" /> Dark Mode</> : <><Icon name="sun" /> Light Mode</>}
                </button>
                <ScrambledTitle />
              </div>
            </header>

            {/* Task Creation Form */}
            {showAddForm && (
              <section className="panel todo-form-panel animate-slide-down">
                <form onSubmit={handleAddTodo} className="todo-form">
                  <div className="form-group">
                    <label htmlFor="task-title">Task Title</label>
                    <input
                      id="task-title"
                      type="text"
                      className="input-field"
                      placeholder="What needs to be done?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={!isOnline}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="task-desc">Description (Optional)</label>
                    <textarea
                      id="task-desc"
                      className="textarea-field"
                      placeholder="Add details about this task..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={!isOnline}
                    />
                  </div>
                  
                  <div className="form-row-grid">
                    <div className="form-group">
                      <label htmlFor="task-priority">Importance</label>
                      <select id="task-priority" className="input-field select-field" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="low">Low Precedence</option>
                        <option value="medium">Medium Precedence</option>
                        <option value="high">High Precedence</option>
                      </select>
                    </div>
                    {/* Only show category selector if not in a project view, otherwise auto-assigned */}
                    {(activeTab === 'today' || activeTab === 'upcoming' || activeTab === 'filters') && (
                      <div className="form-group">
                        <label htmlFor="task-category">Category</label>
                        <select id="task-category" className="input-field select-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                          {['General', 'Work', 'Personal', 'Shopping', 'Ideas', ...projects].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="custom">-- Custom Category --</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {category === 'custom' && (activeTab === 'today' || activeTab === 'upcoming' || activeTab === 'filters') && (
                    <div className="form-group animate-slide-down">
                      <label htmlFor="custom-category">Custom Category Name</label>
                      <input id="custom-category" type="text" className="input-field" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} required />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Due Date & Time</label>
                    <div className="neumorphic-trigger-row">
                      <button type="button" className="neumorphic-trigger-btn" onClick={() => setShowPickerModal(true)} disabled={!isOnline}>
                        {dueAt ? <>📅 {new Date(dueAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</> : "Set Due Date & Time"}
                      </button>
                      {dueAt && (
                        <button type="button" className="neumorphic-clear-trigger-btn" onClick={() => setDueAt('')}>
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={!title.trim() || !isOnline}>
                    Create Task
                  </button>
                </form>
              </section>
            )}

            {activeTab === 'filters' && (
              <section className="controls-bar animate-slide-down">
                <div className="filter-group">
                  <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                  <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Active</button>
                  <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
                </div>
                <div className="select-filter-wrapper">
                  <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="all">All Categories</option>
                    {categoriesList.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="select-filter-wrapper">
                  <span className="sort-label">Sort:</span>
                  <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="time-desc">Newest</option>
                    <option value="time-asc">Oldest</option>
                    <option value="name-asc">A-Z</option>
                    <option value="name-desc">Z-A</option>
                    <option value="importance-desc">High-Low</option>
                    <option value="importance-asc">Low-High</option>
                  </select>
                </div>
              </section>
            )}

            <main className="todos-list">
              {loading && todos.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-text">Loading tasks...</span>
                </div>
              ) : !isOnline && todos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">⚠️</div>
                  <span className="empty-state-text">Backend connection lost.</span>
                  <button className="btn btn-primary" onClick={fetchTodos} style={{ marginTop: '0.5rem' }}>Retry Connection</button>
                </div>
              ) : sortedTodos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><Icon name="empty" /></div>
                  <span className="empty-state-text">No matching tasks found.</span>
                </div>
              ) : (
                <>
                  {pendingHigh.length > 0 && (
                    <div className="todo-group">
                      <h3 className="group-header"><Icon name="high" /> High Precedence</h3>
                      {pendingHigh.map(todo => renderTodoCard(todo))}
                    </div>
                  )}
                  {pendingMedium.length > 0 && (
                    <div className="todo-group">
                      <h3 className="group-header"><Icon name="medium" /> Medium Precedence</h3>
                      {pendingMedium.map(todo => renderTodoCard(todo))}
                    </div>
                  )}
                  {pendingLow.length > 0 && (
                    <div className="todo-group">
                      <h3 className="group-header"><Icon name="low" /> Low Precedence</h3>
                      {pendingLow.map(todo => renderTodoCard(todo))}
                    </div>
                  )}
                  {completedTasks.length > 0 && (
                    <div className="todo-group">
                      <h3 className="group-header"><Icon name="check" /> Completed</h3>
                      {completedTasks.map(todo => renderTodoCard(todo))}
                    </div>
                  )}
                </>
              )}
            </main>
          </main>
        </div>

      {showPickerModal && (
        <CustomDateTimePickerModal
          initialValue={dueAt}
          onSave={(val) => {
            setDueAt(val);
            setShowPickerModal(false);
          }}
          onClose={() => setShowPickerModal(false)}
        />
      )}
      
      {showLoginModal && (
        <ClerkLoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}

export default App;
