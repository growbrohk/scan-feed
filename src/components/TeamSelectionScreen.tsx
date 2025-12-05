import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TeamSelectionScreen({ onTeamSelected }: { onTeamSelected: () => void }) {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [teamCounts, setTeamCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  // Fetch current team counts
  const fetchTeamCounts = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('team');

    if (error) {
      console.error('Error fetching teams:', error);
      return;
    }

    // Count members per team
    const counts: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) {
      counts[i] = 0;
    }
    
    data?.forEach((item) => {
      counts[item.team] = (counts[item.team] || 0) + 1;
    });

    setTeamCounts(counts);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeamCounts();
  }, []);

  const handleConfirm = async () => {
    if (!selectedTeam || !user) {
      toast.error('Please select a team');
      return;
    }

    // Check if team is full
    if (teamCounts[selectedTeam] >= 2) {
      toast.error(`Team ${selectedTeam} is full (2/2)`);
      return;
    }

    setSubmitting(true);

    // Check if user already has a team
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('team')
      .eq('user_id', user.id)
      .single();

    if (existingTeam) {
      // Update existing team
      const { error } = await supabase
        .from('teams')
        .update({ team: selectedTeam })
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to update team. Please try again.');
        console.error('Update error:', error);
      } else {
        toast.success(`Joined Team ${selectedTeam}!`);
        onTeamSelected();
      }
    } else {
      // Insert new team
      const { error } = await supabase
        .from('teams')
        .insert({
          user_id: user.id,
          team: selectedTeam,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You already have a team assigned');
        } else {
          toast.error('Failed to join team. Please try again.');
          console.error('Insert error:', error);
        }
      } else {
        toast.success(`Joined Team ${selectedTeam}!`);
        onTeamSelected();
      }
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Select Your Team</h1>
          <p className="text-muted-foreground text-sm">
            Choose a team (1-10). Each team can have up to 2 members.
          </p>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((teamNum) => {
            const count = teamCounts[teamNum] || 0;
            const isFull = count >= 2;
            const isSelected = selectedTeam === teamNum;
            const isAvailable = !isFull;

            return (
              <button
                key={teamNum}
                onClick={() => {
                  if (isAvailable) {
                    setSelectedTeam(teamNum);
                  } else {
                    toast.error(`Team ${teamNum} is full`);
                  }
                }}
                disabled={!isAvailable || submitting}
                className={cn(
                  'relative p-4 rounded-lg border-2 transition-all',
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : isAvailable
                    ? 'border-border hover:border-primary/50 bg-card'
                    : 'border-muted bg-muted/50 opacity-50 cursor-not-allowed',
                  !isAvailable && 'cursor-not-allowed'
                )}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg font-semibold">Team {teamNum}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{count}/2</span>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-primary absolute top-2 right-2" />
                  )}
                  {isFull && (
                    <span className="text-xs text-destructive font-medium">Full</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleConfirm}
            disabled={!selectedTeam || submitting}
            size="lg"
            className="min-w-[200px]"
          >
            {submitting ? 'Joining...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
}


