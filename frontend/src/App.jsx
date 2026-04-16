// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { Toaster, toast } from 'react-hot-toast';

// Shared Components
import LandingView from './components/shared/LandingView';
import Navbar from './components/shared/Navbar';
import ProfileSettings from './components/shared/ProfileSettings';

// Student Components
import DashboardView from './components/student/DashboardView';
import OnboardingView from './components/student/OnboardingView';
import SkillsModuleView from './components/student/SkillsModuleView';
import MarketModuleView from './components/student/MarketModuleView';
import ServicesModuleView from './components/student/ServicesModuleView';
import PortfolioView from './components/student/PortfolioView';

// Admin Components
import AdminDashboardView from './components/admin/AdminDashboardView';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- MOCK DATA FOR GUEST MODE ---
const MOCK_GUEST_PROFILE = {
  bio: "A highly motivated aspiring tech professional with a strong foundation in scalable software development. Testing system capabilities in Guest Mode.",
  skills: {
    technical: ["JavaScript", "React.js", "Node.js", "Python", "SQL"],
    soft: ["Problem Solving", "Adaptability", "Team Collaboration"],
    transferable: ["Project Management", "Agile Methodologies"]
  },
  kenyan_market_alignment: {
    market_readiness_score: 85,
    best_skill_area_expertise: "Full-Stack Development"
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [view, setView] = useState('landing');
  const [profile, setProfile] = useState(null);
  const [masterProfile, setMasterProfile] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isGeneratingPortfolio, setIsGeneratingPortfolio] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  // CORRECTION: Added state for Render Cold-Start handling
  const [isAuthSyncing, setIsAuthSyncing] = useState(true);

  // CORRECTION: Updated Auth Listener for Production Syncing
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // If we are in Guest mode, don't try to sync with Firebase
      if (isGuest) return; 

      setUser(currentUser);
      
      if (currentUser) {
        setIsAuthSyncing(true); // START LOADING SPINNER
        try {
          const token = await currentUser.getIdToken();
          // Configure axios for all future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Wake up Render and get user role/data
          const response = await axios.post(`${API_BASE_URL}/api/sync-user`, {});
          
          const { role, masterProfile: existingMaster } = response.data;
          setUserRole(role);
          setMasterProfile(existingMaster);

          // Role-Based Routing
          if (role === 'SUPER_ADMIN') setView('dev_dashboard');
          else if (role === 'UNIVERSITY_ADMIN') setView('admin_dashboard');
          else if (role === 'GOVT_ADMIN') setView('govt_dashboard'); 
          else {
            // If they have a master profile, go to dashboard, else onboarding
            setView(existingMaster ? 'dashboard' : 'onboarding');
          }

        } catch (error) {
          console.error("Failed to sync user identity with Render:", error);
          toast.error("Server connection timeout. Retrying...");
          setView('landing'); 
        } finally {
          setIsAuthSyncing(false); // STOP LOADING SPINNER
        }
      } else {
        setView('landing');
        setUserRole(null);
        setIsAuthSyncing(false);
      }
    });
    return () => unsubscribe();
  }, [isGuest]);

  // Handlers
  const handleLogout = () => {
    signOut(auth);
    setIsGuest(false);
    setUserRole(null);
    setMasterProfile(null);
    setView('landing');
  };

  const enterGuestMode = () => {
    setIsGuest(true);
    setUser({ displayName: "Guest User", email: "guest@example.com" });
    setUserRole('STUDENT');
    setMasterProfile(MOCK_GUEST_PROFILE);
    setView('dashboard');
  };

  const handleGenerateMasterProfile = async () => {
    if (isGuest) return toast.error("Please sign in to use AI Synthesis.");
    setIsSynthesizing(true);
    setView('processing');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/synthesize-profile`);
      setMasterProfile(res.data);
      setView('dashboard');
      toast.success("Master Profile Generated!");
    } catch (err) {
      toast.error("Synthesis failed. Check if you have uploaded enough documents.");
      setView('dashboard');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handlePreparePortfolio = async (service) => {
    if (isGuest) return toast.error("Sign in to generate portfolios.");
    setIsGeneratingPortfolio(true);
    setView('processing');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/generate-portfolio`, {
        masterProfile,
        serviceName: service.service_name,
        serviceDescription: service.description
      });
      setPortfolioData(res.data);
      setView('module_portfolio');
    } catch (err) {
      toast.error("Portfolio generation failed.");
      setView('module_services');
    } finally {
      setIsGeneratingPortfolio(false);
    }
  };

  const downloadPDF = (elementId) => {
    const element = document.getElementById(elementId);
    const opt = {
      margin: 10,
      filename: `TU-K-Career-Asset-${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  // --- RENDERING LOGIC ---

  // 1. Loading Screen for Cold Starts
  if (isAuthSyncing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Waking up the AI...</h2>
          <p className="text-slate-500 max-w-sm">
            Securely connecting to the TU-K database. This might take up to 40 seconds on the first load due to server cold-start.
          </p>
      </div>
    );
  }

  // 2. Main Application UI
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Toaster position="top-center" />
      
      <Navbar 
        user={user} 
        isAdmin={userRole === 'SUPER_ADMIN'} 
        view={view} 
        setView={setView} 
        handleLogout={handleLogout}
        masterProfile={masterProfile}
        onGenerateMaster={handleGenerateMasterProfile}
      />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {view === 'landing' && <LandingView onGuest={enterGuestMode} />}
        
        {view === 'onboarding' && (
          <OnboardingView 
            user={user} 
            onFileChange={() => toast.success("File uploaded!")} 
            isUploading={loading} 
            onSkip={() => setView('dashboard')}
          />
        )}

        {view === 'processing' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
             <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
             <h3 className="text-2xl font-bold">
                {isSynthesizing ? 'Synthesizing Master Profile...' : 'Crafting Portfolio Blueprint...'}
             </h3>
          </div>
        )}

        {view === 'dashboard' && (
          <DashboardView 
            user={user} 
            masterProfile={masterProfile} 
            onDownload={() => downloadPDF('master-dashboard-export')}
            onGenerateMaster={handleGenerateMasterProfile}
            isSynthesizing={isSynthesizing} 
            isGuest={isGuest}
          />
        )}
        
        {view === 'admin_dashboard' && <AdminDashboardView />}
        {view === 'settings' && <ProfileSettings user={user} isAdmin={userRole === 'SUPER_ADMIN'} />}

        {/* Module Routing */}
        {view === 'module_skills' && <SkillsModuleView masterProfile={masterProfile} />}
        {view === 'module_market' && <MarketModuleView masterProfile={masterProfile} />}
        {view === 'module_services' && <ServicesModuleView masterProfile={masterProfile} onPrepare={handlePreparePortfolio} />}
        {view === 'module_portfolio' && <PortfolioView portfolioData={portfolioData} onBack={() => setView('module_services')} onDownload={() => downloadPDF('portfolio-export')} />}
      </main>
    </div>
  );
}

export default App;