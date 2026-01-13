import { useState } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function InitializeApartment({ 
  apartmentId, 
  onSuccess 
}: { 
  apartmentId: string
  onSuccess: () => void 
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleInitialize() {
    if (!auth.currentUser) {
      setStatus('error');
      setMessage('❌ No user logged in');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      console.log('🔧 Initializing apartment:', apartmentId);

      const apartmentRef = doc(db, 'apartments', apartmentId);

      // Step 1: Add ownerId
      console.log('📝 Adding ownerId...');
      await updateDoc(apartmentRef, {
        ownerId: auth.currentUser.uid,
      });
      console.log('✅ ownerId added');

      // Step 2: Create subcollections
      const subcollections = ['expenses', 'calendarEvents', 'guests', 'balances'];
      
      for (const collName of subcollections) {
        try {
          const docRef = doc(db, 'apartments', apartmentId, collName, '_init');
          await setDoc(docRef, {
            _initialized: true,
            createdAt: new Date(),
          });
          console.log(`✅ Created collection: ${collName}`);
        } catch (error) {
          console.error(`❌ Error creating ${collName}:`, error);
        }
      }

      setStatus('success');
      setMessage('✅ Apartment initialized successfully!');
      
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('❌ Error:', error);
      setStatus('error');
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-slate-100">Initialize Apartment</h2>
        
        <p className="text-slate-400 mb-6">
          Setting up your apartment with required collections and permissions.
        </p>

        <button
          onClick={handleInitialize}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition mb-4 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader size={20} className="animate-spin" />
              Initializing...
            </>
          ) : (
            'Initialize Now'
          )}
        </button>

        {status === 'success' && (
          <div className="bg-emerald-900 border border-emerald-700 rounded-lg p-4 flex gap-3">
            <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-100">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-100">{message}</p>
          </div>
        )}

        <p className="text-xs text-slate-500 mt-6 text-center">
          Creates: expenses, calendarEvents, guests, balances
        </p>
      </div>
    </div>
  );
}
