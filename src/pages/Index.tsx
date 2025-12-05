import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ScanScreen } from '@/components/ScanScreen';
import { FeedScreen } from '@/components/FeedScreen';
import { TeamSelectionScreen } from '@/components/TeamSelectionScreen';
import { TabNavigation } from '@/components/TabNavigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'feed'>('scan');
  const [hasTeam, setHasTeam] = useState<boolean | null>(null);
  const [checkingTeam, setCheckingTeam] = useState(true);
  const { user, loading, signOut } = useAuth();

  // Check if user has a team
  useEffect(() => {
    const checkTeam = async () => {
      if (!user) {
        setCheckingTeam(false);
        return;
      }

      const { data, error } = await supabase
        .from('teams')
        .select('team')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking team:', error);
      }

      setHasTeam(!!data);
      setCheckingTeam(false);
    };

    checkTeam();
  }, [user]);

  if (loading || checkingTeam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show team selection if user doesn't have a team
  if (hasTeam === false) {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute top-4 right-4 z-10">
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
        <TeamSelectionScreen 
          onTeamSelected={() => setHasTeam(true)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" size="icon" onClick={signOut}>
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
      {activeTab === 'scan' ? <ScanScreen /> : <FeedScreen />}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
