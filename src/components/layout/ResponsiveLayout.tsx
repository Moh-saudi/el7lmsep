'use client';

import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { 
  Home, 
  User, 
  Users, 
  Search, 
  Video, 
  FileText, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Shield,
  GraduationCap,
  Bell,
  MessageSquare,
  BarChart3,
  DollarSign,
  Handshake,
  Star,
  Clock,
  CreditCard,
  Target,
  Settings,
  Globe,
  Play,
  Award,
  TrendingUp,
  Zap,
  Heart,
  Building,
  Briefcase,
  Crown,
  Menu,
  X,
  UserPlus,
  BookOpen,
  Calendar,
  MapPin,
  Headphones,
  Database,
  HardDrive,
  UserCheck,
  UserCog,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Brain,
  Send,
  Mail,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from 'react-responsive';
import LogoutScreen from '@/components/auth/LogoutScreen';

// ===== Context للتحكم في التخطيط =====
interface LayoutContextType {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isClient: boolean;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

// ===== Provider للتحكم في التخطيط =====
export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleSidebarCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar = () => setIsSidebarOpen(true);

  const value: LayoutContextType = {
    isSidebarOpen,
    isSidebarCollapsed,
    isMobile,
    isTablet,
    isDesktop,
    isClient,
    toggleSidebar,
    toggleSidebarCollapse,
    closeSidebar,
    openSidebar,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

// ===== واجهة القائمة =====
interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  color?: string;
  bgColor?: string;
  badge?: string;
  badgeColor?: string;
  children?: MenuItem[];
}

interface MenuGroup {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  items: MenuItem[];
}

// ===== مكون القائمة الجانبية =====
const Sidebar: React.FC<{
  accountType: string;
  userData: any;
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onCollapse: () => void;
}> = ({ accountType, userData, isOpen, isCollapsed, onToggle, onCollapse }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [showLogoutScreen, setShowLogoutScreen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  // ===== الحصول على مجموعات القائمة =====
  const getMenuGroups = (): MenuGroup[] => {
    const baseGroup: MenuGroup = {
      id: 'main',
      title: 'القائمة الرئيسية',
      icon: Home,
      items: [
        {
          id: 'dashboard',
          label: 'لوحة التحكم',
          icon: Home,
          href: `/dashboard/${accountType}`,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        {
          id: 'profile',
          label: 'الملف الشخصي',
          icon: User,
          href: `/dashboard/${accountType}/profile`,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        },
        {
          id: 'messages',
          label: 'الرسائل',
          icon: MessageSquare,
          href: `/dashboard/${accountType}/messages`,
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-50',
          badge: unreadCount > 0 ? unreadCount.toString() : undefined,
          badgeColor: 'bg-red-500'
        }
      ]
    };

    const tournamentsGroup = {
      id: 'tournaments',
      title: 'البطولات',
      icon: Trophy,
      items: [
        {
          id: 'tournaments',
          label: 'البطولات',
          icon: Trophy,
          href: `/tournaments/unified-registration`,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        }
      ]
    };

    const accountSpecificGroups: { [key: string]: MenuGroup[] } = {
      player: [
        {
          id: 'player-features',
          title: 'مميزات اللاعب',
          icon: User,
        items: [
          {
              id: 'player-tournaments',
              label: 'البطولات',
              icon: Trophy,
              href: `/tournaments/unified-registration`,
              color: 'text-yellow-600',
              bgColor: 'bg-yellow-50'
            },
            {
              id: 'videos',
              label: 'الفيديوهات',
              icon: Video,
              href: `/dashboard/player/videos`,
              color: 'text-red-600',
              bgColor: 'bg-red-50'
            },
            {
              id: 'search',
              label: 'البحث عن الفرص',
            icon: Search,
            href: `/dashboard/player/search`,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
          },
          {
              id: 'stats',
              label: 'الإحصائيات',
              icon: BarChart3,
              href: `/dashboard/player/stats`,
              color: 'text-emerald-600',
              bgColor: 'bg-emerald-50'
            }
          ]
        }
      ],
      club: [
        {
          id: 'club-features',
          title: 'مميزات النادي',
          icon: Building,
          items: [
            {
              id: 'club-tournaments',
          label: 'البطولات',
              icon: Trophy,
          href: `/tournaments/unified-registration`,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        },
            {
              id: 'players',
              label: 'اللاعبين',
            icon: Users,
            href: `/dashboard/club/players`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
              id: 'team',
              label: 'الفريق',
              icon: Shield,
              href: `/dashboard/club/team`,
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            }
          ]
        }
      ],
      trainer: [
        {
          id: 'trainer-features',
          title: 'مميزات المدرب',
          icon: GraduationCap,
        items: [
          {
            id: 'trainer-tournaments',
            label: 'البطولات',
              icon: Trophy,
            href: `/tournaments/unified-registration`,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
          },
            {
              id: 'players',
              label: 'اللاعبين',
            icon: Users,
              href: `/dashboard/trainer/players`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
              id: 'schedule',
              label: 'الجدول',
              icon: Calendar,
              href: `/dashboard/trainer/schedule`,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
            }
          ]
        }
      ],
      academy: [
        {
          id: 'academy-features',
          title: 'مميزات الأكاديمية',
          icon: GraduationCap,
          items: [
          {
            id: 'academy-tournaments',
            label: 'البطولات',
              icon: Trophy,
            href: `/tournaments/unified-registration`,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
          },
            {
              id: 'students',
              label: 'الطلاب',
            icon: Users,
              href: `/dashboard/academy/students`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
              id: 'programs',
              label: 'البرامج',
              icon: BookOpen,
              href: `/dashboard/academy/programs`,
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            }
          ]
        }
      ],
      agent: [
        {
          id: 'agent-features',
          title: 'مميزات الوكيل',
          icon: Briefcase,
          items: [
          {
            id: 'agent-tournaments',
            label: 'البطولات',
              icon: Trophy,
            href: `/tournaments/unified-registration`,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
          },
            {
              id: 'clients',
              label: 'العملاء',
            icon: Users,
              href: `/dashboard/agent/clients`,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              id: 'contracts',
              label: 'العقود',
            icon: FileText,
              href: `/dashboard/agent/contracts`,
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            }
          ]
        }
      ],
      admin: [
        {
          id: 'admin-features',
          title: 'إدارة النظام',
          icon: Shield,
        items: [
          {
            id: 'admin-tournaments',
            label: 'إدارة البطولات',
              icon: Trophy,
            href: `/dashboard/admin/tournaments`,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
          },
          {
              id: 'users',
              label: 'إدارة المستخدمين',
              icon: Users,
              href: `/dashboard/admin/users`,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              id: 'analytics',
              label: 'التحليلات',
              icon: BarChart3,
              href: `/dashboard/admin/analytics`,
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            }
          ]
        }
      ],
      marketer: [
        {
          id: 'marketer-features',
          title: 'مميزات المسوق',
        icon: TrendingUp,
        items: [
          {
            id: 'marketer-tournaments',
            label: 'البطولات',
              icon: Trophy,
            href: `/tournaments/unified-registration`,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
          },
            {
              id: 'campaigns',
              label: 'الحملات',
              icon: Target,
              href: `/dashboard/marketer/campaigns`,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              id: 'analytics',
              label: 'التحليلات',
              icon: BarChart3,
              href: `/dashboard/marketer/analytics`,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          }
        ]
        }
      ],
      parent: [
        {
          id: 'parent-features',
          title: 'مميزات الوالد',
          icon: Heart,
        items: [
        {
          id: 'parent-tournaments',
          label: 'البطولات',
              icon: Trophy,
          href: `/tournaments/unified-registration`,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        },
            {
              id: 'children',
              label: 'الأبناء',
              icon: Users,
              href: `/dashboard/parent/children`,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            }
          ]
        }
      ]
    };

    return [baseGroup, tournamentsGroup, ...(accountSpecificGroups[accountType] || [])];
  };

  const menuGroups = getMenuGroups();

  // ===== معالجة النقر على العنصر =====
  const handleItemClick = (href: string) => {
    router.push(href);
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  // ===== معالجة تسجيل الخروج =====
  const handleLogout = () => {
    setShowLogoutScreen(true);
  };

  const confirmLogout = async () => {
      try {
        await logout();
      router.push('/');
      } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  if (showLogoutScreen) {
    return <LogoutScreen onConfirm={confirmLogout} onCancel={() => setShowLogoutScreen(false)} />;
  }

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isOpen ? (isCollapsed ? 80 : 280) : 0,
        opacity: isOpen ? 1 : 0
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-xl z-50 overflow-hidden ${
        isOpen ? 'block' : 'hidden'
      }`}
    >
        <div className="flex flex-col h-full">
          {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userData?.photoURL} />
                <AvatarFallback>
                  {userData?.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {userData?.displayName || 'مستخدم'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {accountType}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
              size="sm"
              onClick={onCollapse}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
                </Button>
            </div>
          </div>

        {/* Menu Groups */}
        <div className="flex-1 overflow-y-auto">
          {menuGroups.map((group) => (
            <div key={group.id} className="p-4">
              {!isCollapsed && (
                <div className="flex items-center space-x-2 mb-3">
                  <group.icon className="h-4 w-4 text-gray-500" />
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              {group.title}
                  </h3>
                      </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                              const IconComponent = item.icon;
                              
                              return (
                    <motion.button
                                  key={item.id}
                      onClick={() => handleItemClick(item.href)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                      isActive
                          ? `${item.bgColor || 'bg-blue-50'} ${item.color || 'text-blue-600'}`
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-right">{item.label}</span>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className={`text-xs ${item.badgeColor || 'bg-red-500'} text-white`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </motion.button>
                              );
                            })}
                          </div>
            </div>
          ))}
        </div>

          {/* Footer */}
        <div className="border-t border-gray-200 p-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
            className="w-full flex items-center space-x-3 text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span>تسجيل الخروج</span>}
            </Button>
          </div>
        </div>
    </motion.aside>
  );
};

// ===== مكون الهيدر =====
const Header: React.FC<{
  accountType: string;
  userData: any;
  onToggleSidebar: () => void;
}> = ({ accountType, userData, onToggleSidebar }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 capitalize">
              لوحة تحكم {accountType}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                {unreadCount}
              </Badge>
              )}
          </Button>

          <Avatar className="h-8 w-8">
            <AvatarImage src={userData?.photoURL} />
            <AvatarFallback>
              {userData?.displayName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

// ===== المكون الرئيسي =====
export interface ResponsiveLayoutWrapperProps {
  children: React.ReactNode;
  accountType?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const ResponsiveLayoutWrapper: React.FC<ResponsiveLayoutWrapperProps> = ({
  children,
  accountType = 'player',
  showSidebar = true,
  showHeader = true,
  showFooter = true
}) => {
  const { user, userData, loading } = useAuth();
  const { isSidebarOpen, isSidebarCollapsed, isMobile, toggleSidebar, toggleSidebarCollapse } = useLayout();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-600 font-medium">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
        </div>
      </div>
    );
  }

  return (
    <LayoutProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            accountType={accountType}
            userData={userData}
            isOpen={isSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
            onCollapse={toggleSidebarCollapse}
          />
        )}

        {/* Main Content */}
        <div className={`transition-all duration-300 ${
          showSidebar && isSidebarOpen
            ? isMobile
              ? 'ml-0'
              : isSidebarCollapsed
                ? 'mr-20'
                : 'mr-80'
            : 'mr-0'
        }`}>
          {/* Header */}
          {showHeader && (
            <Header
              accountType={accountType}
              userData={userData}
              onToggleSidebar={toggleSidebar}
            />
          )}
        
        {/* Content */}
          <main className="p-4">
              {children}
        </main>
      
      {/* Footer */}
          {showFooter && (
            <footer className="bg-white border-t border-gray-200 px-4 py-3">
              <div className="text-center text-sm text-gray-500">
                © 2024 El7lm. جميع الحقوق محفوظة.
    </div>
            </footer>
          )}
        </div>

        {/* Overlay for mobile */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleSidebar}
          />
        )}
      </div>
    </LayoutProvider>
  );
};

export default ResponsiveLayoutWrapper;