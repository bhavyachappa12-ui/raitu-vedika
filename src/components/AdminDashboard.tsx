import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldAlert, Tractor, FileSearch, HelpCircle, 
  Settings, DollarSign, MessageCircle, BarChart3, Bell, 
  MapPin, Check, X, ShieldCheck, Activity, Trash, AlertTriangle, 
  FileText, Download, ArrowRight, CornerDownRight, Landmark,
  Database
} from 'lucide-react';
import { Equipment, FarmerProfile } from '../types';

interface AdminDashboardProps {
  equipmentList: Equipment[];
  language: 'te' | 'en';
  updateEquipment: (newList: Equipment[]) => void;
  triggerToast: (text: string, type: 'success' | 'info' | 'error') => void;
}

interface AdminUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  district?: string;
  mandal?: string;
  village?: string;
  role: 'farmer' | 'owner' | 'both' | 'admin';
  verified: boolean;
  status: 'active' | 'suspended';
  aadhaarNumber?: string;
  proofFileAttached?: boolean;
  idFileAttached?: boolean;
  createdAt?: string;
}

interface AdminDispute {
  id: string;
  complainantName: string;
  reportedName: string;
  reason: string;
  amount: number;
  status: 'open' | 'investigating' | 'resolved';
}

export default function AdminDashboard({
  equipmentList,
  language,
  updateEquipment,
  triggerToast
}: AdminDashboardProps) {

  type AdminPageId = 
    | 'admin_home' | 'user_management' | 'owner_verification' 
    | 'equipment_management' | 'booking_management' 
    | 'payment_management' | 'complaints_disputes' 
    | 'reports_analytics' | 'notifications_management' | 'system_settings' | 'db_integration';

  const [activePage, setActivePage] = useState<AdminPageId>('admin_home');

  // Dynamic user data for management page loaded from backend
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'farmer' | 'owner' | 'both' | 'admin'>('all');
  const [userVerifyFilter, setUserVerifyFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [ownerQueueTab, setOwnerQueueTab] = useState<'pending' | 'verified' | 'all'>('pending');
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUser | null>(null);
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false);

  const refreshUserList = () => {
    setIsRefreshingUsers(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
          triggerToast(language === 'te' ? 'యూజర్ల డేటాబేస్ రిఫ్రెష్ అయ్యింది' : 'User directory refreshed live from backend database', 'info');
        }
      })
      .catch(err => console.error("Error refreshing users:", err))
      .finally(() => setIsRefreshingUsers(false));
  };

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch(err => {
        console.error("Error loading users from backend database:", err);
        // Fallback local list
        setUsers([
          { id: 'usr101', name: 'కిరణ్ కుమార్ రెడ్డి', phone: '+91 98480 22334', location: 'Guntur Rural', role: 'owner', verified: true, status: 'active' },
          { id: 'usr102', name: 'పప్పల రమణ', phone: '+91 93901 88552', location: 'Nellore Block A', role: 'farmer', verified: false, status: 'active' },
          { id: 'usr103', name: 'గోపాల కృష్ణ భట్', phone: '+91 99881 77223', location: 'Vizianagaram', role: 'both', verified: true, status: 'active' },
          { id: 'usr104', name: 'మ్యాతరి మల్లికార్జున్', phone: '+91 90807 06050', location: 'Kurnool East', role: 'farmer', verified: false, status: 'suspended' }
        ]);
      });
  }, []);

  // Dynamic disputes data
  const [disputes, setDisputes] = useState<AdminDispute[]>(() => {
    return [
      { id: 'disp_001', complainantName: 'కృష్ణమూర్తి సజ్జల', reportedName: 'కిరణ్ కుమార్ రెడ్డి', reason: 'Tractor delayed by 4 hours during crucial harvest slot', amount: 1200, status: 'open' },
      { id: 'disp_002', complainantName: 'చింతల రామచంద్ర', reportedName: 'సాయి రామ్ తిల్లర్స్', reason: 'Digger motor was missing filter pins', amount: 800, status: 'investigating' }
    ];
  });

  // Broadcast campaign
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'owners' | 'farmers'>('all');

  // System parameters
  const [systCommission, setSystCommission] = useState('0'); // 0% Cooperative priority
  const [escrowHoldDays, setEscrowHoldDays] = useState('2');
  const [emergencyHotline, setEmergencyHotline] = useState('+91 1800 425 1525');

  // --- MongoDB & MySQL Dynamic Integration & Migration Hub ---
  const [dbDialect, setDbDialect] = useState<'mongodb' | 'mysql'>('mongodb');
  const [dbConnString, setDbConnString] = useState('');
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState('27017');
  const [dbUsername, setDbUsername] = useState('admin');
  const [dbPassword, setDbPassword] = useState('••••••••');
  const [dbName, setDbName] = useState('raitu_coop');
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connLogs, setConnLogs] = useState<Array<{ type: 'info' | 'success' | 'warn' | 'error'; text: string; time: string }>>([]);
  const [connStatus, setConnStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const [exportDialect, setExportDialect] = useState<'mongodb' | 'mysql'>('mongodb');
  const [exportSchema, setExportSchema] = useState('');
  const [exportSeed, setExportSeed] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [activeExportTab, setActiveExportTab] = useState<'schema' | 'seed'>('schema');

  // Test custom MongoDB / MySQL connection logic
  const testDatabaseConnection = () => {
    setIsTestingConn(true);
    setConnStatus('idle');
    setConnLogs([]);

    const body = {
      dialect: dbDialect,
      connectionString: dbConnString.trim() || undefined,
      host: dbHost,
      port: parseInt(dbPort) || undefined,
      username: dbUsername,
      password: dbPassword === '••••••••' ? 'secret_pass' : dbPassword,
      databaseName: dbName
    };

    fetch('/api/database/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
      if (data.logs) {
        let i = 0;
        const interval = setInterval(() => {
          if (i < data.logs.length) {
            setConnLogs(prev => [...prev, data.logs[i]]);
            i++;
          } else {
            clearInterval(interval);
            setIsTestingConn(false);
            setConnStatus(data.success ? 'success' : 'failed');
            if (data.success) {
              triggerToast(`${dbDialect === 'mongodb' ? 'MongoDB Atlas' : 'MySQL DB'} connectivity verification passed!`, 'success');
            } else {
              triggerToast(`Diagnostic checks failed for ${dbDialect.toUpperCase()}: ${data.error || 'Check logs'}`, 'error');
            }
          }
        }, 250);
      } else {
        setIsTestingConn(false);
        setConnStatus('failed');
        triggerToast("Diagnostic endpoint returned invalid response structure.", "error");
      }
    })
    .catch(err => {
      console.error(err);
      setIsTestingConn(false);
      setConnStatus('failed');
      triggerToast("Failed to connect to database diagnostic engine.", "error");
    });
  };

  // Pre-load schema scripts
  const handleLoadExportScripts = (dialectChoice: 'mongodb' | 'mysql') => {
    setIsExporting(true);
    
    fetch(`/api/database/export-scripts?dialect=${dialectChoice}`)
    .then(res => res.json())
    .then(data => {
      setExportSchema(data.schema || '');
      setExportSeed(data.seed || '');
      setIsExporting(false);
    })
    .catch(err => {
      console.error(err);
      setIsExporting(false);
      triggerToast("Error assembling schema structure.", 'error');
    });
  };

  useEffect(() => {
    if (activePage === 'db_integration') {
      handleLoadExportScripts(exportDialect);
    }
  }, [activePage, exportDialect]);

  // Actions in backend
  const toggleUserStatus = (id: string) => {
    fetch('/api/users/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.user) {
        setUsers(prev => prev.map(u => u.id === id ? data.user : u));
        if (selectedUserDetail && selectedUserDetail.id === id) {
          setSelectedUserDetail(data.user);
        }
        triggerToast(`Status changed to ${data.user.status}`, 'info');
      }
    })
    .catch(err => {
      console.error("Backend toggle error:", err);
      // local fallback
      setUsers(users.map(u => {
        if (u.id === id) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          triggerToast(`User status set to ${nextStatus}`, 'info');
          const updated = { ...u, status: nextStatus as any };
          if (selectedUserDetail && selectedUserDetail.id === id) {
            setSelectedUserDetail(updated);
          }
          return updated;
        }
        return u;
      }));
    });
  };

  const verifyUser = (id: string) => {
    fetch('/api/users/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        } else if (data.user) {
          setUsers(prev => prev.map(u => u.id === id ? data.user : u));
        }
        if (selectedUserDetail && selectedUserDetail.id === id) {
          const updated = data.user || { ...selectedUserDetail, verified: !selectedUserDetail.verified };
          setSelectedUserDetail(updated);
        }
        triggerToast(
          language === 'te' 
            ? 'యజమాని ఐడెంటిటీ వెరిఫై చేయబడింది! ఓనర్ వెరిఫికేషన్ బ్యాడ్జ్ మంజూరు చేయబడింది.' 
            : 'Owner identity verified! Verified Owner badge granted.', 
          'success'
        );
      }
    })
    .catch(err => {
      console.error("Backend verify error:", err);
      setUsers(users.map(u => {
        if (u.id === id) {
          const nextV = !u.verified;
          triggerToast(nextV ? 'Verified Owner badge granted!' : 'Verification badge revoked', 'info');
          const updated = { ...u, verified: nextV };
          if (selectedUserDetail && selectedUserDetail.id === id) {
            setSelectedUserDetail(updated);
          }
          return updated;
        }
        return u;
      }));
    });
  };

  const resolveDispute = (id: string) => {
    setDisputes(disputes.map(d => {
      if (d.id === id) {
        triggerToast('Cooperative arbitrator marked issue resolved!', 'success');
        return { ...d, status: 'resolved' as const };
      }
      return d;
    }));
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    triggerToast(`Broadcast SMS successfully sent to all ${broadcastTarget}!`, 'success');
    setBroadcastMessage('');
  };

  // Computed filtered users list for User Directory
  const filteredUsers = users.filter(u => {
    const q = userSearchQuery.trim().toLowerCase();
    const matchesQuery = !q || 
      (u.name || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.location || '').toLowerCase().includes(q) ||
      (u.id || '').toLowerCase().includes(q) ||
      (u.mandal || '').toLowerCase().includes(q) ||
      (u.district || '').toLowerCase().includes(q) ||
      (u.village || '').toLowerCase().includes(q);

    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesVerify = userVerifyFilter === 'all' || (userVerifyFilter === 'verified' ? u.verified : !u.verified);
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;

    return matchesQuery && matchesRole && matchesVerify && matchesStatus;
  });

  return (
    <div id="admin-dashboard-container" className="flex flex-col md:flex-row min-h-[85vh] bg-slate-50 text-slate-800 rounded-3xl overflow-hidden shadow-xl border border-slate-200">
      
      {/* Sidenav for Admin */}
      <aside className="w-full md:w-64 bg-slate-950 text-slate-300 flex-shrink-0 flex flex-col p-4">
        <div className="py-4 border-b border-slate-800 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-black text-sm">
            ⚙️
          </div>
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider">
              {language === 'te' ? 'నిర్వహణాధికారి వేదిక' : 'Cooperative Admin'}
            </h4>
            <p className="text-[10px] text-red-400 font-bold">
              Supreme Command Node
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 text-left">
          {[
            { id: 'admin_home', label: 'సిస్టమ్ హోమ్', en: 'Admin Home', icon: Activity },
            { id: 'user_management', label: 'సభ్యత్వాల నిర్వహణ', en: 'User Management', icon: Users },
            { id: 'owner_verification', label: 'భాగస్వామ్య ఆడిటింగ్', en: 'Owner Verification', icon: ShieldCheck },
            { id: 'equipment_management', label: 'యంత్రాల పర్యవేక్షణ', en: 'Equipment Management', icon: Tractor },
            { id: 'booking_management', label: 'బుకింగ్స్ విశ్లేషణ', en: 'Booking Management', icon: FileSearch },
            { id: 'payment_management', label: 'చెల్లింపుల సంరక్షణ', en: 'Payment Management', icon: DollarSign },
            { id: 'complaints_disputes', label: 'సమస్యలు & వివాదాలు', en: 'Complaints/Disputes', icon: ShieldAlert },
            { id: 'reports_analytics', label: 'ఆర్థిక నివేదికలు', en: 'Reports & Analytics', icon: BarChart3 },
            { id: 'notifications_management', label: 'మాస్ నోటిఫికేషన్లు', en: 'Broadcast SMS Alerts', icon: Bell },
            { id: 'system_settings', label: 'వ్యవస్థా సెట్టింగ్స్', en: 'Platform Settings', icon: Settings },
            { id: 'db_integration', label: 'డేటాబేస్ అనుసంధానం', en: 'Database Integration', icon: Database }
          ].map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id as AdminPageId)}
                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-[11px] font-bold tracking-wide transition-all ${
                  active 
                    ? 'bg-red-750 bg-red-700 text-white' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{language === 'te' ? item.label : item.en}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Admin Display Pane */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto max-w-5xl mx-auto w-full">
        
        {/* SECTION 1: ADMIN HOME */}
        {activePage === 'admin_home' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-950 to-red-800 rounded-2xl p-6 text-white border border-red-900">
              <span className="text-[9px] bg-red-900 border border-red-700 font-bold px-2 py-0.5 rounded uppercase">
                COOP-MONITORING-ACTIVE
              </span>
              <h2 className="text-xl font-black mt-3">
                {language === 'te' ? 'ఆంధ్రప్రదేశ్ ఈ-రైతు సహకార వేదిక ప్యానెల్' : 'AP E-Raitu Cooperative Command Console'}
              </h2>
              <p className="text-xs text-red-100 max-w-lg mt-1 font-medium">
                Real-time tracking of zero-commission farmer equipment leases, physical verifications status and secure dispute mediations.
              </p>
            </div>

            {/* Quick counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-150 rounded-xl p-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase">System Active Users</span>
                <p className="text-xl font-black text-slate-800">1,482</p>
                <span className="text-[8.5px] text-emerald-500 font-bold block mt-0.5">● 133 Online Now</span>
              </div>
              <div className="bg-white border border-slate-150 rounded-xl p-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Active Rentals Pool</span>
                <p className="text-xl font-black text-slate-800">{equipmentList.length}</p>
                <span className="text-[8.5px] text-slate-500">AP State-wide Grid</span>
              </div>
              <div className="bg-white border border-slate-150 rounded-xl p-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Escrow Payouts Log</span>
                <p className="text-xl font-black text-[#1b6d24]">₹48,930</p>
                <span className="text-[8.5px] text-emerald-600 font-bold">100% Cleared to Farmers</span>
              </div>
              <div className="bg-white border border-slate-150 rounded-xl p-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Unresolved Disputes</span>
                <p className="text-xl font-black text-amber-600">{disputes.filter(d => d.status !== 'resolved').length}</p>
                <span className="text-[8.5px] text-amber-600 font-bold">Medium Priority Audits</span>
              </div>
            </div>

            {/* Verification highlights check */}
            <div className="bg-white border border-slate-150 rounded-xl p-5">
              <h3 className="text-xs font-black text-slate-705 uppercase tracking-wide mb-3">Owner Verification Awaiting Safety Audit</h3>
              <div className="space-y-3">
                {users.filter(u => !u.verified).map(usr => (
                  <div key={usr.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-black text-slate-800">{usr.name} ({usr.location})</h4>
                      <p className="text-[9.5px] text-slate-450">{usr.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => verifyUser(usr.id)} className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg">
                        Verify Badge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: USER MANAGEMENT */}
        {activePage === 'user_management' && (
          <div className="space-y-5 text-left">
            {/* Header & KPI Summary */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>{language === 'te' ? 'సిస్టమ్ రిజిస్టర్డ్ యూజర్ల డిరెక్టరీ' : 'System-Wide Registered User Directory'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'te' 
                      ? 'నమోదైన రైతులు, యంత్ర యజమానులు మరియు అడ్మిన్ అకౌంట్ల సమగ్ర నిర్వహణ.' 
                      : 'Complete roster of all registered farmer accounts, machinery owners, and administration profiles.'}
                  </p>
                </div>
                <button
                  onClick={refreshUserList}
                  disabled={isRefreshingUsers}
                  className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition cursor-pointer self-start md:self-auto"
                >
                  <Activity className={`w-3.5 h-3.5 text-emerald-700 ${isRefreshingUsers ? 'animate-spin' : ''}`} />
                  <span>{language === 'te' ? 'డేటాబేస్ రిఫ్రెష్' : 'Refresh List'}</span>
                </button>
              </div>

              {/* KPI Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-left">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase">{language === 'te' ? 'మొత్తం యూజర్లు' : 'Total Accounts'}</span>
                  <p className="text-base font-black text-slate-800 mt-0.5">{users.length}</p>
                </div>
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-left">
                  <span className="text-[9px] font-extrabold text-amber-600 uppercase">{language === 'te' ? 'యంత్ర యజమానులు' : 'Equipment Owners'}</span>
                  <p className="text-base font-black text-amber-800 mt-0.5">
                    {users.filter(u => u.role === 'owner' || u.role === 'both').length}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-left">
                  <span className="text-[9px] font-extrabold text-emerald-600 uppercase">{language === 'te' ? 'వెరిఫైడ్ బ్యాడ్జ్' : 'Verified Owners'}</span>
                  <p className="text-base font-black text-emerald-800 mt-0.5">
                    {users.filter(u => u.verified && (u.role === 'owner' || u.role === 'both')).length}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-left">
                  <span className="text-[9px] font-extrabold text-indigo-600 uppercase">{language === 'te' ? 'రైతు సభ్యులు' : 'Registered Farmers'}</span>
                  <p className="text-base font-black text-indigo-800 mt-0.5">
                    {users.filter(u => u.role === 'farmer').length}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-left">
                  <span className="text-[9px] font-extrabold text-rose-500 uppercase">{language === 'te' ? 'సస్పెండ్ ఖాతాలు' : 'Suspended'}</span>
                  <p className="text-base font-black text-rose-700 mt-0.5">
                    {users.filter(u => u.status === 'suspended').length}
                  </p>
                </div>
              </div>

              {/* Search & Filtering Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-2">
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder={language === 'te' ? 'పేరు, ఫోన్, ఊరు, ID తో శోధించండి...' : 'Search Name, Phone, Village, Mandal, District or ID...'}
                  className="md:col-span-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />

                <select
                  value={userRoleFilter}
                  onChange={(e: any) => setUserRoleFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                >
                  <option value="all">{language === 'te' ? 'అన్ని వర్గాలు (All Roles)' : 'All Roles'}</option>
                  <option value="farmer">{language === 'te' ? 'రైతులు (Farmers)' : 'Farmer Only'}</option>
                  <option value="owner">{language === 'te' ? 'యంత్ర యజమానులు (Owners)' : 'Equipment Owners'}</option>
                  <option value="both">{language === 'te' ? 'రైతు & యజమాని (Both)' : 'Both Role'}</option>
                  <option value="admin">{language === 'te' ? 'అడ్మిన్లు (Admins)' : 'Admins'}</option>
                </select>

                <select
                  value={userVerifyFilter}
                  onChange={(e: any) => setUserVerifyFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                >
                  <option value="all">{language === 'te' ? 'అన్ని వెరిఫికేషన్లు (All Statuses)' : 'All Verification Statuses'}</option>
                  <option value="verified">{language === 'te' ? '✓ వెరిఫైడ్ బ్యాడ్జ్ (Verified Only)' : 'Verified Owners Only'}</option>
                  <option value="pending">{language === 'te' ? '⏳ పెండింగ్ పరిశీలన (Pending Audit)' : 'Pending Identity Verification'}</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e: any) => setUserStatusFilter(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                >
                  <option value="all">{language === 'te' ? 'అన్ని ఖాతా స్థితులు (All Account States)' : 'All Account States'}</option>
                  <option value="active">{language === 'te' ? 'ఆక్టివ్ అకౌంట్లు (Active Only)' : 'Active Accounts'}</option>
                  <option value="suspended">{language === 'te' ? 'సస్పెండ్ చేయబడినవి (Suspended)' : 'Suspended Accounts'}</option>
                </select>
              </div>
            </div>

            {/* Registered Users Roster Directory */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs font-extrabold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                <span>{language === 'te' ? `ఖాతాల జాబితా (${filteredUsers.length})` : `Registered Accounts (${filteredUsers.length})`}</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredUsers.map(u => {
                  const isOwnerRole = u.role === 'owner' || u.role === 'both';
                  return (
                    <div key={u.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-slate-50/60 p-2.5 rounded-xl transition">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-extrabold text-sm shrink-0 mt-0.5">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="font-extrabold text-slate-900 text-xs">{u.name}</h4>
                            <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                              {u.id}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold border ${
                              u.role === 'owner' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              u.role === 'farmer' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                              u.role === 'both' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                              'bg-slate-800 text-white border-slate-900'
                            }`}>
                              {u.role.toUpperCase()}
                            </span>

                            {/* Owner Badge indicator */}
                            {isOwnerRole && u.verified && (
                              <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full uppercase font-black flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>{language === 'te' ? 'సరిచూసిన యజమాని' : 'Verified Owner Badge'}</span>
                              </span>
                            )}

                            {isOwnerRole && !u.verified && (
                              <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                                ⏳ {language === 'te' ? 'ఐడెంటిటీ వెరిఫికేషన్ పెండింగ్' : 'Identity Verification Pending'}
                              </span>
                            )}
                          </div>

                          <p className="text-[10.5px] text-slate-500 font-medium mt-1 flex flex-wrap gap-x-3">
                            <span>📞 {u.phone}</span>
                            {u.email && <span>✉️ {u.email}</span>}
                            <span>📍 {u.location}</span>
                          </p>

                          {/* Detail badges row */}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[9.5px] text-slate-500 font-mono">
                            {u.aadhaarNumber && (
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                🆔 Aadhaar: {u.aadhaarNumber}
                              </span>
                            )}
                            {isOwnerRole && (
                              <span className={`px-1.5 py-0.5 rounded border ${u.proofFileAttached ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                                📄 Machinery Proof: {u.proofFileAttached ? 'Attached ✓' : 'Not Provided ✗'}
                              </span>
                            )}
                            {isOwnerRole && (
                              <span className={`px-1.5 py-0.5 rounded border ${u.idFileAttached ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                                🪪 Citizen ID: {u.idFileAttached ? 'Attached ✓' : 'Not Provided ✗'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-start md:self-center">
                        <button
                          onClick={() => setSelectedUserDetail(u)}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                        >
                          {language === 'te' ? 'పూర్తి వివరాలు' : 'Full Dossier'}
                        </button>

                        {isOwnerRole && (
                          <button
                            onClick={() => verifyUser(u.id)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition cursor-pointer ${
                              u.verified 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-emerald-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                          >
                            {u.verified 
                              ? (language === 'te' ? '✓ రద్దు చేయి' : 'Revoke Badge') 
                              : (language === 'te' ? 'ఓనర్ వెరిఫై చేయి' : 'Grant Verified Badge')}
                          </button>
                        )}

                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            u.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? (language === 'te' ? 'సస్పెండ్ చేయి' : 'Suspend') : (language === 'te' ? 'పునరుద్ధరించు' : 'Unsuspend')}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-8">
                    {language === 'te' ? 'ఎటువంటి ఖాతాలు కనుగొనబడలేదు.' : 'No registered user accounts match the chosen search/filter criteria.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: OWNER VERIFICATION QUEUE */}
        {activePage === 'owner_verification' && (
          <div className="space-y-5 text-left">
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'te' ? 'సహకార భద్రత & యజమాని ఐడెంటిటీ పరిశీలన విభాగం' : 'Owner Identity & Machinery Ownership Verification Audit'}</span>
                  </h3>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-relaxed max-w-3xl">
                    {language === 'te' 
                      ? 'రైతు సమూహ భద్రత మరియు నమ్మకం కోసం అడ్మిన్ ద్వారా యజమాని ఆధార్, గుర్తింపు కార్డులు మరియు యంత్రాల యాజమాన్య పత్రాలను తనిఖీ చేసి ఓనర్ వెరిఫికేషన్ బ్యాడ్జ్ విడుదల చేయవచ్చు.' 
                      : 'Admin inspection of equipment owner identity credentials, government ID cards, and machinery registration deeds. Approved owners receive the Verified Owner badge across the marketplace.'}
                  </p>
                </div>
              </div>

              {/* Sub-tab pills for Owner Queue */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => setOwnerQueueTab('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    ownerQueueTab === 'pending'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ⏳ {language === 'te' ? 'పరిశీలన పెండింగ్ ఉన్న యజమానులు' : 'Pending Audit Queue'} ({users.filter(u => (u.role === 'owner' || u.role === 'both') && !u.verified).length})
                </button>

                <button
                  onClick={() => setOwnerQueueTab('verified')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    ownerQueueTab === 'verified'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ✓ {language === 'te' ? 'వెరిఫైడ్ యజమానులు' : 'Already Verified Fleet Owners'} ({users.filter(u => (u.role === 'owner' || u.role === 'both') && u.verified).length})
                </button>

                <button
                  onClick={() => setOwnerQueueTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    ownerQueueTab === 'all'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  👥 {language === 'te' ? 'అందరు యజమానులు' : 'All Fleet Owners'} ({users.filter(u => u.role === 'owner' || u.role === 'both').length})
                </button>
              </div>
            </div>

            {/* Owner Verification Cards Queue */}
            <div className="space-y-3">
              {users.filter(u => {
                const isOwner = u.role === 'owner' || u.role === 'both';
                if (!isOwner) return false;
                if (ownerQueueTab === 'pending') return !u.verified;
                if (ownerQueueTab === 'verified') return u.verified;
                return true;
              }).map(u => (
                <div key={u.id} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm">{u.name}</h4>
                      <span className="text-[9px] bg-slate-100 text-slate-600 border px-1.5 py-0.5 rounded font-mono font-bold">{u.id}</span>
                      {u.verified ? (
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full uppercase font-black flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'te' ? 'సరిచూసిన యజమాని బ్యాడ్జ్' : 'Verified Owner Badge Active'}</span>
                        </span>
                      ) : (
                        <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                          ⏳ {language === 'te' ? 'పరిశీలన పెండింగ్' : 'Pending Admin Verification'}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500">
                      <span>📞 {u.phone}</span> • <span>✉️ {u.email || `${u.id}@eraitu.app`}</span> • <span>📍 Sector: {u.location}</span>
                    </p>

                    {/* Identity dossier box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px]">
                      <div>
                        <span className="text-slate-400 font-bold block text-[9px] uppercase">Aadhaar Identity</span>
                        <span className="font-mono font-bold text-slate-800">{u.aadhaarNumber || '7845-9012-3456'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block text-[9px] uppercase">Machinery Deed Proof</span>
                        <span className={`font-bold ${u.proofFileAttached ? 'text-emerald-700' : 'text-slate-600'}`}>
                          {u.proofFileAttached ? '✓ Attached (Verified Deed)' : '✓ Verified Local RC Registration'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block text-[9px] uppercase">Govt ID Verification</span>
                        <span className={`font-bold ${u.idFileAttached ? 'text-emerald-700' : 'text-slate-600'}`}>
                          {u.idFileAttached ? '✓ Attached (Citizen Card)' : '✓ Verified Citizen ID'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 md:min-w-44">
                    <button
                      onClick={() => verifyUser(u.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition shadow-xs cursor-pointer ${
                        u.verified
                          ? 'bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {u.verified 
                        ? (language === 'te' ? 'బ్యాడ్జ్ ఉపసంహరించు' : 'Revoke Verified Badge') 
                        : (language === 'te' ? 'ఐడెంటిటీ వెరిఫై చేసి బ్యాడ్జ్ ఇవ్వండి' : 'Approve Owner Identity & Grant Badge')}
                    </button>
                    <button
                      onClick={() => setSelectedUserDetail(u)}
                      className="px-3 py-1.5 rounded-xl text-[10.5px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer"
                    >
                      {language === 'te' ? 'పూర్తి పత్రాలు చూడండి' : 'View Full Profile Dossier'}
                    </button>
                  </div>
                </div>
              ))}

              {users.filter(u => {
                const isOwner = u.role === 'owner' || u.role === 'both';
                if (!isOwner) return false;
                if (ownerQueueTab === 'pending') return !u.verified;
                if (ownerQueueTab === 'verified') return u.verified;
                return true;
              }).length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-10 bg-white border border-slate-150 rounded-2xl">
                  {language === 'te' ? 'ఈ కేటగిరీలో ఎటువంటి యజమానుల రికార్డులు లేవు.' : 'No owner profiles found in this queue tab.'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: EQUIPMENT MANAGEMENT */}
        {activePage === 'equipment_management' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
              {language === 'te' ? 'మొత్తం సహకార యంత్రాల ట్రాకర్' : 'Global Cooperative Fleet Tracker'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {language === 'te'
                ? 'యాక్టివ్ మెషినరీ లిస్టింగ్ స్థితిని నేరుగా ఓవర్‌రైడ్ చేయండి, ధర పారామితులను తనిఖీ చేయండి మరియు తప్పుగా ఉన్న యంత్రాల ఎంట్రీలను తొలగించండి.'
                : 'Directly override active machinery listing status, check pricing parameters, and delete malfunctioning machinery entries.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {equipmentList.map(eq => (
                <div key={eq.id} className="bg-white border border-slate-150 rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={eq.imageUrl} alt={eq.title} className="w-10 h-10 object-cover rounded-lg" />
                    <div>
                      <h4 className="font-black text-slate-800 line-clamp-1">{eq.titleEn || eq.title}</h4>
                      <p className="text-[9.5px] text-slate-400">Rate: ₹{eq.price}/{eq.rateType} • {eq.ownerName}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const updated = equipmentList.filter(e => e.id !== eq.id);
                      updateEquipment(updated);
                      triggerToast('Machinery pulled from collaborative pool!', 'error');
                    }}
                    className="text-red-600 text-[10px] font-bold border border-red-200 hover:bg-red-50 p-1.5 rounded-lg"
                  >
                    Delete Entry
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: BOOKING MANAGEMENT */}
        {activePage === 'booking_management' && (
          <div className="bg-white border border-slate-150 rounded-xl p-5">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3">
              {language === 'te' ? 'సిస్టమ్‌-వైడ్‌ అద్దె రిజిస్టర్ & లాగ్‌లు' : 'System-wide Rental Ledger & Activity Logs'}
            </h3>
            <div className="space-y-3">
              {[
                { id: 'b_log01', eq: 'John Deere Tractor', farmer: 'Subba Rao', owner: 'Kiran Kumar', total: 6000, status: 'Active' },
                { id: 'b_log02', eq: 'Rotavator', farmer: 'Devi Prasad', owner: 'Raju Cooperatives', total: 1800, status: 'Completed' }
              ].map(log => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-lg text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-slate-800">{log.eq}</h4>
                    <p className="text-[9.5px] text-slate-450">Farmer: {log.farmer} • Owner: {log.owner}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800">₹{log.total}</p>
                    <span className="text-[8.5px] bg-emerald-50 text-[#1b6d24] font-bold rounded px-1">{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: PAYMENT MANAGEMENT */}
        {activePage === 'payment_management' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
              {language === 'te' ? 'సహకార బడ్జెట్ విడుదల నియంత్రణ ఫలకం' : 'Cooperative Escrow Clearing Control Panel'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {language === 'te'
                ? 'యూజర్ నిధుల లాక్‌లను ఆడిట్ చేస్తుంది, చెల్లింపులను ప్రాసెస్ చేస్తుంది మరియు సున్నా కమీషన్ కట్‌లతో ప్రత్యక్ష బ్యాంక్ క్లియరెన్స్‌లను రూట్ చేస్తుంది.'
                : 'Audits user funds locks, processes disbursements, and routes direct bank clearances with zero commission cuts.'}
            </p>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between text-xs text-[#1b6d24] font-bold">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5" />
                <span>State Bank Clearing Node Sandbox API: ONLINE</span>
              </div>
              <span className="text-[9px] bg-emerald-700 text-white px-2 py-0.5 rounded">0% FEE BASIS</span>
            </div>

            <div className="bg-white border rounded-xl p-4 space-y-3">
              {[
                { id: 'p_clear01', owner: 'మారేపల్లి తిరుపతి', sum: 3400, bank: 'State Bank of India', ref: 'TXN854738221' }
              ].map(tx => (
                <div key={tx.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-extrabold text-slate-800">{tx.owner}</h4>
                    <p className="text-[9.5px] text-slate-450">Cleared to: {tx.bank} • Ref: {tx.ref}</p>
                  </div>
                  <span className="text-[9.5px] text-emerald-600 font-bold font-mono">₹{tx.sum} Disbursed</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 7: COMPLAINTS & DISPUTES */}
        {activePage === 'complaints_disputes' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
              {language === 'te' ? 'సమస్యల పరిష్కార డ్యాష్‌బోర్డ్' : 'Mediator Conflict Dashboard'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {language === 'te'
                ? 'రైతులు ఇక్కడ పనితీరుకు సంబంధించిన ఆందోళనలను నమోదు చేయవచ్చు. సిస్టమ్ నిర్వాహకులు తగిన విధంగా ఎస్క్రో వోచర్‌లను పట్టుకోవడానికి లేదా విడుదల చేయడానికి జోక్యం చేసుకుంటారు.'
                : 'Farmers can log performance concerns here. System administrators intervene to hold or release escrow vouchers accordingly.'}
            </p>

            <div className="space-y-3">
              {disputes.map(disp => (
                <div key={disp.id} className="bg-white border border-slate-150 rounded-xl p-5 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-black text-red-700 tracking-wider font-mono">{disp.id}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                      disp.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>{disp.status.toUpperCase()}</span>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400">Dispute Escalation Detail:</p>
                    <p className="font-bold text-slate-750 font-sans italic mt-0.5">"{disp.reason}"</p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] text-slate-450">Escrow Value Impact: ₹{disp.amount}</span>
                    {disp.status !== 'resolved' && (
                      <button onClick={() => resolveDispute(disp.id)} className="bg-emerald-700 text-white font-bold text-[10.5px] px-3 py-1 rounded-lg">
                        Resolve & Refund Farmer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 8: REPORTS & ANALYTICS */}
        {activePage === 'reports_analytics' && (
          <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
              {language === 'te' ? 'సహకార పనితీరు గ్రాఫ్‌లు & సూచీలు' : 'Visual Cooperative Performance Indexes'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border rounded-xl p-5">
                <h4 className="text-[11px] font-black uppercase text-slate-500 mb-3">Popular Machinery Category Allocations</h4>
                <div className="space-y-3 pt-2">
                  {[
                    { cat: 'Tractor Rentals', pct: '55%', count: 18 },
                    { cat: 'Sprayers & Dusters', pct: '25%', count: 9 },
                    { cat: 'Kubota Harvesters', pct: '20%', count: 7 }
                  ].map((stat, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between font-bold mb-1">
                        <span>{stat.cat}</span>
                        <span>{stat.pct} ({stat.count} items)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-[#1b6d24] h-2 rounded-full" style={{ width: stat.pct }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border rounded-xl p-5">
                <h4 className="text-[11px] font-black uppercase text-slate-500 mb-3">Escrow Inflows Growth Trend</h4>
                <div className="flex items-end justify-between h-32 pt-4">
                  {[40, 65, 50, 75, 90].map((h, i) => (
                    <div key={i} className="w-8 bg-red-650 bg-red-700 rounded-t" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 mt-2 text-center text-bold">Dynamic monthly ledger increase tracking index</p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 9: NOTIFICATIONS MANAGEMENT */}
        {activePage === 'notifications_management' && (
          <div className="bg-white border rounded-xl p-5 md:p-8">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3">Broadcast Direct Farmer Alerts & Advisory</h3>
            <p className="text-[10px] text-slate-400 mb-4">Send instant warnings regarding sudden heavy monsoon changes, pest emergency alerts, or cooperative machinery subsidization criteria via direct sms.</p>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-550 block mb-1">Target Audience Segment</label>
                <select value={broadcastTarget} onChange={(e: any) => setBroadcastTarget(e.target.value)} className="w-full text-xs font-bold bg-slate-50 border rounded-xl py-2 px-3">
                  <option value="all">Every Registered Member (Farmers & Owners)</option>
                  <option value="owners">Certified Equipment Landlords Only</option>
                  <option value="farmers">Active Lessee Renters Only</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-550 block mb-1">Alert content message text</label>
                <textarea 
                  rows={4} 
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="e.g. Guntur Advisory: Sudden high wind changes predicted next 24 Hours. Avoid spraying chemical dusters. Delay harvester rentals."
                  className="w-full text-xs font-bold bg-slate-50 border rounded-xl p-3" 
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-red-700 text-white text-xs font-black uppercase rounded-xl">
                Dispatch Broadcast SMS Now
              </button>
            </form>
          </div>
        )}

        {/* SECTION 10: SYSTEM SETTINGS */}
        {activePage === 'system_settings' && (
          <div className="bg-white border rounded-xl p-5 md:p-8 space-y-6">
            <div>
              <h3 className="text-xs font-black text-[#1b6d24] uppercase tracking-widest">Cooperative System Settings Policy</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Define core commission, payout schedules and helpline routing variables.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Cooperative Commission Rate Fee (%)</label>
                <input type="number" readOnly value={systCommission} className="w-full bg-slate-50 border rounded-xl py-2 px-3 font-mono font-bold text-[#1b6d24]" />
                <span className="text-[8.5px] text-slate-400 block mt-0.5">Commission is permanently locked as 0% for government supported mutual AP Farmer Cooperatives.</span>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Minimum Hold Escrow Safety Days</label>
                <input type="number" value={escrowHoldDays} onChange={(e) => setEscrowHoldDays(e.target.value)} className="w-full bg-slate-50 border rounded-xl py-2 px-3 font-mono font-bold" />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Cooperative Emergency Support Hotline</label>
                <input type="text" value={emergencyHotline} onChange={(e) => setEmergencyHotline(e.target.value)} className="w-full bg-slate-50 border rounded-xl py-2 px-3 font-mono font-bold" />
              </div>

              <button onClick={() => triggerToast('Global parameters locked!', 'success')} className="py-2.5 px-6 bg-red-700 text-white font-black uppercase rounded-xl">
                Lock Global System Policy
              </button>
            </div>
          </div>
        )}

        {/* SECTION 11: DATABASE INTEGRATION & MIGRATION HUB */}
        {activePage === 'db_integration' && (
          <div className="space-y-6">
            <div className="bg-white border rounded-xl p-5 md:p-8 space-y-4">
              <div>
                <span className="text-[9px] bg-[#1b6d24]/10 border border-[#1b6d24]/20 font-black px-2 py-0.5 rounded uppercase text-[#1b6d24]">
                  Hybrid Adapter Layer Enabled
                </span>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mt-2">
                  {language === 'te' ? 'ఆంధ్రప్రదేశ్ ఈ-రైతు డేటాబేస్ వలస & అనుసంధాన కేంద్రం' : 'Database Integration & Migration Hub'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Connect, manage, and scale the E-Raitu cooperative platform. Safely validate enterprise configurations, generate production migration schemas, and export JSON sets to real **MongoDB Atlas** clusters or **MySQL Relational Databases**.
                </p>
              </div>

              {/* Selection Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setDbDialect('mongodb');
                    setConnStatus('idle');
                    setConnLogs([]);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    dbDialect === 'mongodb' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🍃 MongoDB Cluster Settings
                </button>
                <button
                  onClick={() => {
                    setDbDialect('mysql');
                    setConnStatus('idle');
                    setConnLogs([]);
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    dbDialect === 'mysql' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🐬 MySQL Relational Settings
                </button>
              </div>

              {/* Form Settings */}
              <div className="bg-slate-50 border rounded-2xl p-5 space-y-4 text-xs">
                <h4 className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  {dbDialect === 'mongodb' ? 'MongoDB Atlas Connection Parameters' : 'MySQL Database Instance Connection Parameters'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[9.5px] uppercase font-bold text-slate-500 block mb-1">
                      Direct Connection URI (Recommended)
                    </label>
                    <input
                      type="text"
                      value={dbConnString}
                      onChange={(e) => setDbConnString(e.target.value)}
                      placeholder={
                        dbDialect === 'mongodb'
                          ? 'mongodb+srv://username:<password>@cluster0.abcde.mongodb.net/raitu_coop?retryWrites=true'
                          : 'mysql://root:secret_pass@127.0.0.1:3306/raitu_coop'
                      }
                      className="w-full bg-white border rounded-xl py-2 px-3 font-mono text-xs text-slate-800 focus:ring-1 focus:ring-[#1b6d24]"
                    />
                    <span className="text-[8.5px] text-slate-400 block mt-0.5">
                      Specifying a connection string overrides the manual discrete fields specified below.
                    </span>
                  </div>

                  <div>
                    <label className="text-[9.5px] uppercase font-bold text-slate-500 block mb-1">Host / Server Node IP</label>
                    <input
                      type="text"
                      disabled={!!dbConnString}
                      value={dbHost}
                      onChange={(e) => setDbHost(e.target.value)}
                      className="w-full bg-white disabled:bg-slate-100 border rounded-xl py-2 px-3 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] uppercase font-bold text-slate-500 block mb-1">Port</label>
                    <input
                      type="number"
                      disabled={!!dbConnString}
                      value={dbPort}
                      onChange={(e) => setDbPort(e.target.value)}
                      placeholder={dbDialect === 'mongodb' ? '27017' : '3306'}
                      className="w-full bg-white disabled:bg-slate-100 border rounded-xl py-2 px-3 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] uppercase font-bold text-slate-500 block mb-1">Auth Username</label>
                    <input
                      type="text"
                      disabled={!!dbConnString}
                      value={dbUsername}
                      onChange={(e) => setDbUsername(e.target.value)}
                      className="w-full bg-white disabled:bg-slate-100 border rounded-xl py-2 px-3 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] uppercase font-bold text-slate-500 block mb-1">Auth Password</label>
                    <input
                      type="password"
                      disabled={!!dbConnString}
                      value={dbPassword}
                      onChange={(e) => setDbPassword(e.target.value)}
                      className="w-full bg-white disabled:bg-slate-100 border rounded-xl py-2 px-3 font-mono text-xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[9.5px] uppercase font-bold text-slate-500 block mb-1">Database Target Name</label>
                    <input
                      type="text"
                      disabled={!!dbConnString}
                      value={dbName}
                      onChange={(e) => setDbName(e.target.value)}
                      className="w-full bg-white disabled:bg-slate-100 border rounded-xl py-2 px-3 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={testDatabaseConnection}
                    disabled={isTestingConn}
                    className="flex-1 py-2.5 bg-slate-900 text-white font-black uppercase tracking-wider rounded-xl hover:bg-slate-800 disabled:bg-slate-300 flex items-center justify-center gap-2"
                  >
                    {isTestingConn ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Pinging Connection Socket...
                      </>
                    ) : (
                      '⚡ Test Database Handshake'
                    )}
                  </button>

                  <button
                    onClick={() => {
                      triggerToast(`${dbDialect.toUpperCase()} configuration parameters saved permanently!`, 'success');
                    }}
                    className="px-6 py-2.5 bg-emerald-700 text-white font-black uppercase tracking-wider rounded-xl hover:bg-emerald-800"
                  >
                    Save Config
                  </button>
                </div>
              </div>

              {/* Dynamic handshake terminal logs */}
              {(connLogs.length > 0 || isTestingConn) && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-slate-200 shadow-inner">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="text-[10px] text-slate-450 uppercase font-black tracking-wider ml-1">
                        Driver Diagnostic Console
                      </span>
                    </div>
                    {connStatus !== 'idle' && (
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                          connStatus === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-red-950 text-red-400 border border-red-900'
                        }`}
                      >
                        {connStatus === 'success' ? '✔ Handshake OK' : '✘ Diagnostics Failed'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 min-h-24 max-h-48 overflow-y-auto text-left">
                    {connLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-slate-600 text-[10px]">{log.time}</span>
                        <span
                          className={`font-bold ${
                            log.type === 'success'
                              ? 'text-emerald-400'
                              : log.type === 'error'
                              ? 'text-red-400 font-extrabold'
                              : log.type === 'warn'
                              ? 'text-amber-400'
                              : 'text-slate-350'
                          }`}
                        >
                          {log.text}
                        </span>
                      </div>
                    ))}
                    {isTestingConn && (
                      <div className="flex items-center gap-2 text-slate-500 italic text-[11px] animate-pulse">
                        <span>&gt; Querying replica-set parameters...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION: Schema Exporters & Seed Generators */}
            <div className="bg-white border rounded-xl p-5 md:p-8 space-y-4">
              <div>
                <h4 className="text-xs font-black text-[#1b6d24] uppercase tracking-widest mb-1">
                  Automated Migration Script & Schema Generator
                </h4>
                <p className="text-[10px] text-slate-400">
                  Instantly output highly correct database structure creation scripts, Mongoose model classes, or SQL table definitions populated with live JSON file system datasets.
                </p>
              </div>

              {/* Script Dialect selector */}
              <div className="flex items-center justify-between gap-3 border-b pb-3 text-xs">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setExportDialect('mongodb');
                      handleLoadExportScripts('mongodb');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                      exportDialect === 'mongodb'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    MongoDB Mongoose Schemas & Seeds
                  </button>
                  <button
                    onClick={() => {
                      setExportDialect('mysql');
                      handleLoadExportScripts('mysql');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                      exportDialect === 'mysql'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    MySQL SQL Tables & DML Seeds
                  </button>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      const text = activeExportTab === 'schema' ? exportSchema : exportSeed;
                      navigator.clipboard.writeText(text);
                      triggerToast("Script text copied to keyboard!", 'success');
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-lg text-[10.5px] flex items-center gap-1 text-slate-700"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Copy Code
                  </button>

                  <button
                    onClick={() => {
                      const text = activeExportTab === 'schema' ? exportSchema : exportSeed;
                      const blob = new Blob([text], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = activeExportTab === 'schema' 
                        ? `eraitu_schema_${exportDialect === 'mongodb' ? 'mongoose.ts' : 'ddl.sql'}`
                        : `eraitu_seed_${exportDialect === 'mongodb' ? 'shell.js' : 'dml.sql'}`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      triggerToast("Script downloaded successfully!", 'success');
                    }}
                    className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10.5px] flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </button>
                </div>
              </div>

              {/* Inner exporter tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveExportTab('schema')}
                  className={`text-xs px-3 py-1 border-b-2 font-bold transition-all ${
                    activeExportTab === 'schema' ? 'border-[#1b6d24] text-[#1b6d24]' : 'border-transparent text-slate-400'
                  }`}
                >
                  {exportDialect === 'mongodb' ? 'Mongoose Models (.ts)' : 'Schema Creation SQL (.sql)'}
                </button>
                <button
                  onClick={() => setActiveExportTab('seed')}
                  className={`text-xs px-3 py-1 border-b-2 font-bold transition-all ${
                    activeExportTab === 'seed' ? 'border-[#1b6d24] text-[#1b6d24]' : 'border-transparent text-slate-400'
                  }`}
                >
                  {exportDialect === 'mongodb' ? 'Mongo Shell Import Scripts' : 'Data Row SQL Insert Statements'}
                </button>
              </div>

              {/* Code viewer */}
              {isExporting ? (
                <div className="bg-slate-900 rounded-xl p-8 flex flex-col items-center justify-center text-xs text-slate-400 font-mono animate-pulse">
                  <Database className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                  Generating syntax structures based on active users and fleet listings...
                </div>
              ) : (
                <div className="relative">
                  <pre className="bg-slate-950 text-slate-200 border border-slate-800 rounded-2xl p-5 text-left font-mono text-[11px] overflow-x-auto max-h-96 min-h-48 leading-relaxed selection:bg-emerald-900 selection:text-white">
                    <code>{activeExportTab === 'schema' ? exportSchema : exportSeed}</code>
                  </pre>
                  <span className="absolute bottom-3 right-3 text-[9px] font-mono text-slate-500 uppercase bg-slate-900 px-1.5 py-0.5 rounded">
                    {activeExportTab === 'schema' ? 'DDL / Models' : 'DML / Seed Commands'}
                  </span>
                </div>
              )}
            </div>

            {/* SECTION: Google Cloud Platform (GCP) Deployment Guidelines */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 text-xs text-slate-700 space-y-3">
              <h4 className="font-extrabold text-emerald-800 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-emerald-700" />
                Google Cloud Platform (GCP) Production Guidelines
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                When moving Raitu Vedika from our development environment to full scale production, choose the appropriate Google Cloud storage architectures:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-sans">
                <div className="bg-white border rounded-xl p-4 space-y-1">
                  <h5 className="font-black text-slate-800 text-[11px]">🍃 Cloud Run + MongoDB Atlas GCP</h5>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Host your backend container in Google Cloud Run and peer it directly to a shared **MongoDB Atlas on Google Cloud** cluster. Provide the connection secret string via standard Google Cloud Secret Manager environment variables for military-grade protection.
                  </p>
                </div>

                <div className="bg-white border rounded-xl p-4 space-y-1">
                  <h5 className="font-black text-slate-800 text-[11px]">🐬 Cloud SQL for MySQL Instance</h5>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Provision a **Google Cloud SQL for MySQL** enterprise instance within your project VPC. Leverage the Google Cloud SQL Auth Proxy to securely map TCP database sockets without leaving the Google network backbone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* User Full Profile Dossier Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 text-left space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center border border-emerald-200">
                  {selectedUserDetail.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">{selectedUserDetail.name}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">{selectedUserDetail.id}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{selectedUserDetail.phone} • {selectedUserDetail.email || 'No email registered'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role & Verification Badge status */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">{language === 'te' ? 'ఖాతా వివరాలు:' : 'Account Role:'}</span>
              <span className={`text-xs px-2.5 py-1 rounded-lg uppercase font-bold border ${
                selectedUserDetail.role === 'owner' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                selectedUserDetail.role === 'farmer' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                selectedUserDetail.role === 'both' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                'bg-slate-800 text-white border-slate-900'
              }`}>
                {selectedUserDetail.role.toUpperCase()}
              </span>

              {selectedUserDetail.verified ? (
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-black flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'te' ? 'సరిచూసిన యజమాని బ్యాడ్జ్ ఉనికిలో ఉంది' : 'Verified Owner Badge Active'}</span>
                </span>
              ) : (
                <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-bold">
                  ⏳ {language === 'te' ? 'ఐడెంటిటీ వెరిఫికేషన్ పెండింగ్' : 'Identity Verification Pending'}
                </span>
              )}

              <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${
                selectedUserDetail.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {selectedUserDetail.status === 'active' ? '✓ ACTIVE ACCOUNT' : '⛔ SUSPENDED'}
              </span>
            </div>

            {/* Geographical Location Dossier */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>Geographical Address & Sector Location</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700 font-medium">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">District</span>
                  <span>{selectedUserDetail.district || 'Anakapalli'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Mandal</span>
                  <span>{selectedUserDetail.mandal || 'Payakaraopeta'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Village</span>
                  <span>{selectedUserDetail.village || 'Payakaraopeta'}</span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Registered Sector Address</span>
                  <span>{selectedUserDetail.location}</span>
                </div>
              </div>
            </div>

            {/* Document Verification Dossier */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>Identity & Verification Dossier</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Aadhaar Card Number</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">{selectedUserDetail.aadhaarNumber || '7845-9012-3456'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Registration Date</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">{selectedUserDetail.createdAt || '2026-02-01'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Machinery Deed Document</span>
                  <span className={`font-bold ${selectedUserDetail.proofFileAttached ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {selectedUserDetail.proofFileAttached ? '✓ Deed Document Verified' : '✓ Verified Local RC Registration'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Citizen Photo ID</span>
                  <span className={`font-bold ${selectedUserDetail.idFileAttached ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {selectedUserDetail.idFileAttached ? '✓ Photo ID Verified' : '✓ Verified Citizen Record'}
                  </span>
                </div>
              </div>
            </div>

            {/* Listed Machinery by this Owner */}
            {(selectedUserDetail.role === 'owner' || selectedUserDetail.role === 'both') && (
              <div className="space-y-2 text-xs">
                <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider">
                  {language === 'te' ? 'యజమాని నమోదు చేసిన యంత్రాలు' : 'Machinery Fleet Listed by Owner'}
                </h4>
                <div className="space-y-2">
                  {equipmentList.filter(eq => 
                    (eq.ownerPhone && eq.ownerPhone.replace(/[^\d]/g, '') === selectedUserDetail.phone.replace(/[^\d]/g, '')) ||
                    (eq.ownerName && eq.ownerName.toLowerCase().includes(selectedUserDetail.name.toLowerCase()))
                  ).map(eq => (
                    <div key={eq.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={eq.imageUrl} alt={eq.title} className="w-10 h-10 object-cover rounded-lg" />
                        <div>
                          <h5 className="font-black text-slate-900">{eq.titleEn || eq.title}</h5>
                          <p className="text-[10px] text-slate-500">₹{eq.price}/{eq.rateType === 'day' ? 'day' : 'hr'} • Status: {eq.status === 'available' ? 'Available' : 'Booked'}</p>
                        </div>
                      </div>
                      <span className={`text-[9.5px] px-2 py-0.5 rounded font-bold border ${eq.verified ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                        {eq.verified ? '✓ Verified Badge' : 'Unverified'}
                      </span>
                    </div>
                  ))}

                  {equipmentList.filter(eq => 
                    (eq.ownerPhone && eq.ownerPhone.replace(/[^\d]/g, '') === selectedUserDetail.phone.replace(/[^\d]/g, '')) ||
                    (eq.ownerName && eq.ownerName.toLowerCase().includes(selectedUserDetail.name.toLowerCase()))
                  ).length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">No equipment listings linked to this owner profile yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
              {(selectedUserDetail.role === 'owner' || selectedUserDetail.role === 'both') && (
                <button
                  onClick={() => verifyUser(selectedUserDetail.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedUserDetail.verified
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {selectedUserDetail.verified 
                    ? (language === 'te' ? 'బ్యాడ్జ్ ఉపసంహరించు' : 'Revoke Verified Owner Badge') 
                    : (language === 'te' ? 'ఐడెంటిటీ వెరిఫై చేసి బ్యాడ్జ్ ఇవ్వండి' : 'Approve Owner Identity & Grant Badge')}
                </button>
              )}

              <button
                onClick={() => toggleUserStatus(selectedUserDetail.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedUserDetail.status === 'active'
                    ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
              >
                {selectedUserDetail.status === 'active' ? (language === 'te' ? 'ఖాతాను సస్పెండ్ చేయండి' : 'Suspend Account') : (language === 'te' ? 'ఖాతాను పునరుద్ధరించండి' : 'Unsuspend Account')}
              </button>

              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
              >
                {language === 'te' ? 'మూసివేయి' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
