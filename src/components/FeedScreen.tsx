import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { RefreshCw, Inbox } from 'lucide-react';
import { format } from 'date-fns';

interface Scan {
  id: number;
  code: number;
  created_at: string;
  user_id: string | null;
}

export function FeedScreen() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
    } else {
      setScans(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScans();

    // Subscribe to realtime updates for all scans
    const channel = supabase
      .channel('scans-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scans'
        },
        (payload) => {
          setScans((current) => [payload.new as Scan, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">Scanned Codes</h1>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={fetchScans}
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {loading && scans.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              No scans yet — try scanning a QR code.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Scan Item</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell className="font-mono text-sm">
                      {scan.user_id || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-mono text-lg font-medium text-foreground">
                          {scan.code}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(scan.created_at), 'yyyy-MM-dd HH:mm')}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
