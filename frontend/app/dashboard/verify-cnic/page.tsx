'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle2, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyCnicPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [cnicNumber, setCnicNumber] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 13) val = val.substring(0, 13);
    
    // Format as XXXXX-XXXXXXX-X
    let formatted = val;
    if (val.length > 5 && val.length <= 12) {
      formatted = `${val.substring(0, 5)}-${val.substring(5)}`;
    } else if (val.length > 12) {
      formatted = `${val.substring(0, 5)}-${val.substring(5, 12)}-${val.substring(12)}`;
    }
    setCnicNumber(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cnicNumber.length < 15) {
      setError('Please enter a valid 13-digit CNIC number');
      return;
    }
    if (!frontImage || !backImage) {
      setError('Please upload both front and back images of your CNIC');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // In a real application, you would upload the images to Cloudinary here
      // and send the URLs to the backend. We'll simulate this for now by 
      // calling the verification endpoint with placeholder URLs.
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documents: [
            { type: 'cnic', url: `https://dummy-image-url.com/front-${cnicNumber}.jpg` },
            { type: 'cnic', url: `https://dummy-image-url.com/back-${cnicNumber}.jpg` }
          ]
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit verification');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-2xl mx-auto text-center mt-20">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Verification Submitted</h1>
          <p className="text-earth-500 mb-8">
            Your CNIC has been submitted successfully. Our admin team will review it shortly. You will be notified once it is approved.
          </p>
          <Link href="/dashboard" className="btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center text-earth-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Identity Verification</h1>
          <p className="text-earth-500">Please provide your CNIC details to become a verified user.</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">CNIC Number</label>
              <input 
                type="text" 
                value={cnicNumber}
                onChange={handleCnicChange}
                className="input-field text-lg tracking-wider" 
                placeholder="XXXXX-XXXXXXX-X"
                maxLength={15}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Front Image */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Front of CNIC</label>
                <div className="border-2 border-dashed border-line rounded-xl p-6 text-center hover:bg-primary/5 transition-colors cursor-pointer relative overflow-hidden group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
                    required
                  />
                  {frontImage ? (
                    <div className="text-primary flex flex-col items-center">
                      <FileText className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium truncate w-full px-2">{frontImage.name}</span>
                    </div>
                  ) : (
                    <div className="text-earth-400 group-hover:text-primary transition-colors flex flex-col items-center">
                      <UploadCloud className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">Upload Front</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Back Image */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Back of CNIC</label>
                <div className="border-2 border-dashed border-line rounded-xl p-6 text-center hover:bg-primary/5 transition-colors cursor-pointer relative overflow-hidden group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setBackImage(e.target.files?.[0] || null)}
                    required
                  />
                  {backImage ? (
                    <div className="text-primary flex flex-col items-center">
                      <FileText className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium truncate w-full px-2">{backImage.name}</span>
                    </div>
                  ) : (
                    <div className="text-earth-400 group-hover:text-primary transition-colors flex flex-col items-center">
                      <UploadCloud className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">Upload Back</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed">
              <strong>Note:</strong> Uploaded images must be clear and readable. Both front and back sides are required. The verification process usually takes 1-2 business days.
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base shadow-lg justify-center font-semibold mt-4">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Submit for Verification'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
