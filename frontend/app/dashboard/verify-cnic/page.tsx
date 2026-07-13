'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle2, FileText, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const API = process.env.NEXT_PUBLIC_API_URL;

async function uploadToCloudinary(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', 'documents');

  const res = await fetch(`${API}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Image upload failed');
  }

  const data = await res.json();
  return data.url as string;
}

export default function VerifyCnicPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [cnicNumber, setCnicNumber] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
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
    let formatted = val;
    if (val.length > 5 && val.length <= 12) {
      formatted = `${val.substring(0, 5)}-${val.substring(5)}`;
    } else if (val.length > 12) {
      formatted = `${val.substring(0, 5)}-${val.substring(5, 12)}-${val.substring(12)}`;
    }
    setCnicNumber(formatted);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const preview = URL.createObjectURL(file);
    if (side === 'front') {
      setFrontImage(file);
      setFrontPreview(preview);
    } else {
      setBackImage(file);
      setBackPreview(preview);
    }
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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated. Please log in again.');

      // Step 1: Upload front image
      setUploadStep('Uploading front CNIC image…');
      const frontUrl = await uploadToCloudinary(frontImage, token);

      // Step 2: Upload back image
      setUploadStep('Uploading back CNIC image…');
      const backUrl = await uploadToCloudinary(backImage, token);

      // Step 3: Submit to verification endpoint
      setUploadStep('Submitting verification…');
      const res = await fetch(`${API}/api/auth/verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cnic: cnicNumber,
          documents: [
            { type: 'cnic', url: frontUrl },
            { type: 'cnic', url: backUrl },
          ],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Verification submission failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      setUploadStep('');
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
            Your CNIC has been submitted successfully. Our admin team will review it within 1–2 business days.
            You will be notified once it is approved.
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
          <p className="text-earth-500">Please provide your CNIC details to become a verified seller.</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
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
                <div className="border-2 border-dashed border-line rounded-xl overflow-hidden hover:border-primary/50 transition-colors cursor-pointer relative group bg-background/50">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => handleFileChange(e, 'front')}
                    required
                  />
                  {frontPreview ? (
                    <div className="relative w-full h-40">
                      <Image src={frontPreview} alt="CNIC Front" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-earth-400 group-hover:text-primary transition-colors flex flex-col items-center">
                      <UploadCloud className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">Upload Front</span>
                      <span className="text-xs mt-1 text-earth-300">JPG, PNG up to 10MB</span>
                    </div>
                  )}
                </div>
                {frontImage && (
                  <p className="text-xs text-earth-400 mt-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {frontImage.name}
                  </p>
                )}
              </div>

              {/* Back Image */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Back of CNIC</label>
                <div className="border-2 border-dashed border-line rounded-xl overflow-hidden hover:border-primary/50 transition-colors cursor-pointer relative group bg-background/50">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => handleFileChange(e, 'back')}
                    required
                  />
                  {backPreview ? (
                    <div className="relative w-full h-40">
                      <Image src={backPreview} alt="CNIC Back" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-earth-400 group-hover:text-primary transition-colors flex flex-col items-center">
                      <UploadCloud className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">Upload Back</span>
                      <span className="text-xs mt-1 text-earth-300">JPG, PNG up to 10MB</span>
                    </div>
                  )}
                </div>
                {backImage && (
                  <p className="text-xs text-earth-400 mt-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {backImage.name}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed">
              <strong>Note:</strong> Uploaded images must be clear and readable. Both front and back sides are required. The verification process usually takes 1–2 business days.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base shadow-lg justify-center font-semibold mt-4 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {uploadStep || 'Submitting…'}
                </span>
              ) : (
                'Submit for Verification'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
