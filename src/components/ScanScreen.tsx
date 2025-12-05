import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ScanLine, Camera, X } from 'lucide-react';

const CODE_REGEX = /^[0-9]{7}$/;

export function ScanScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const handleScan = async (result: { rawValue: string }[]) => {
    if (isProcessing || !result?.[0]?.rawValue) return;
    
    const scannedString = result[0].rawValue.trim();
    setIsProcessing(true);

    // Validate the scanned code
    if (!CODE_REGEX.test(scannedString)) {
      toast.error('Invalid QR — must be a 7-digit number.');
      setIsProcessing(false);
      return;
    }

    if (!user) {
      toast.error('You must be logged in to scan.');
      setIsProcessing(false);
      return;
    }

    const codeNumber = Number(scannedString);

    // Insert into database with user_id
    const { error } = await supabase
      .from('scans')
      .insert({ code: codeNumber, user_id: user.id });

    if (error) {
      toast.error('Failed to save scan. Please try again.');
      console.error('Insert error:', error);
    } else {
      toast.success(`Saved: ${codeNumber}`);
      setIsScanning(false);
    }

    setIsProcessing(false);
  };

  const handleError = (error: unknown) => {
    console.error('Scanner error:', error);
    toast.error('Camera error. Please check permissions.');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6">
      {!isScanning ? (
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center">
            <ScanLine className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">QR Scanner</h1>
            <p className="text-muted-foreground text-sm max-w-xs">
              Scan a QR code containing a 7-digit number to save it
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setIsScanning(true)}
            className="gap-2 text-base px-8"
          >
            <Camera className="w-5 h-5" />
            Scan QR Code
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-card shadow-lg">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{ facingMode: 'environment' }}
              styles={{
                container: { borderRadius: '1rem' },
                video: { borderRadius: '1rem' }
              }}
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => setIsScanning(false)}
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
