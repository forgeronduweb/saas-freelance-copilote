import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  // Stats communes
  totalEarnings?: number;
  totalSpent?: number;
  completedProjects?: number;
  activeProjects?: number;
  myProjects?: number;
  rating?: number;

  // Stats admin
  totalUsers?: number;
  totalFreelances?: number;
  totalClients?: number;
  totalProjects?: number;

  // Données récentes
  recentUsers?: any[];
  recentProjects?: any[];
}

interface DashboardData {
  stats: DashboardStats | null;
  profile: any | null;
  projects: any[];
  loading: boolean;
  error: string | null;
}

export function useDashboard() {
  // Tous les hooks doivent être appelés inconditionnellement
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<DashboardData>({
    stats: null,
    profile: null,
    projects: [],
    loading: true,
    error: null
  });

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔐 Session expirée pour les stats...');
          return null;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors du chargement des statistiques');
      }
      const stats = await response.json();
      return stats;
    } catch (error) {
      console.error('Erreur stats:', error);
      return null;
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/dashboard/profile');
      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔐 Session expirée pour le profil...');
          return null;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors du chargement du profil');
      }
      const profile = await response.json();
      return profile;
    } catch (error) {
      console.error('Erreur profil:', error);
      return null;
    }
  };

  const fetchProjects = async (page = 1, status = 'all') => {
    try {
      const response = await fetch(`/api/dashboard/projects?page=${page}&status=${status}`);
      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔐 Session expirée, redirection vers la connexion...');
          return [];
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors du chargement des projets');
      }
      const data = await response.json();
      return data.projects || [];
    } catch (error) {
      console.error('Erreur projets:', error);
      return [];
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const response = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour du profil');
      
      const updatedProfile = await response.json();
      setData(prev => ({ ...prev, profile: updatedProfile }));
      return updatedProfile;
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      throw error;
    }
  };

  const createProject = async (projectData: any) => {
    try {
      const response = await fetch('/api/dashboard/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) throw new Error('Erreur lors de la création du projet');
      
      const newProject = await response.json();
      setData(prev => ({ 
        ...prev, 
        projects: [newProject, ...prev.projects] 
      }));
      return newProject;
    } catch (error) {
      console.error('Erreur création projet:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    if (!isAuthenticated) return;

    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [stats, profile, projects] = await Promise.all([
        fetchStats(),
        fetchProfile(),
        fetchProjects()
      ]);

      setData({
        stats,
        profile,
        projects,
        loading: false,
        error: null
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Erreur lors du chargement des données'
      }));
    }
  };

  // useEffect appelé inconditionnellement
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  return {
    ...data,
    refreshData,
    updateProfile,
    createProject,
    fetchProjects: (page?: number, status?: string) => 
      fetchProjects(page, status).then(projects => {
        setData(prev => ({ ...prev, projects }));
        return projects;
      })
  };
}
