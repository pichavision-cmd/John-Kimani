import React, { useState, useEffect, useRef, useMemo } from 'react';
// FIX: Corrected import path for types
import type { RiderProfile, Reminder } from '../types';
import { saccoData } from './SaccoFinder';
// FIX: Corrected import path for icons
import { XCircleIcon, CameraIcon, DocumentTextIcon, IdentificationIcon } from './icons';

interface RiderProfileProps {
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const initialProfileState: RiderProfile = {
  fullName: '',
  idNumber: '',
  phoneNumber: '',
  passportPhoto: '',
  operatingArea: '',
  motorbikeReg: '',
  drivingLicenceNo: '',
  licenceClass: '',
  ntsaCertificate: '',
  ntsaCertificateName: '',
  saccoName: '',
  saccoMembershipNo: '',
  insurancePolicyNo: '',
  insuranceExpiry: '',
};

const RiderProfile: React.FC<RiderProfileProps> = ({ onClose, triggerRef }) => {
  const [profile, setProfile] = useState<RiderProfile>(initialProfileState);
  const [errors, setErrors] = useState<{ [key in keyof Partial<RiderProfile>]: string }>({});
  const [saccoSearchTerm, setSaccoSearchTerm] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = 'rider-profile-title';

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('boda-rider-profile');
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error("Failed to load profile from localStorage", error);
    }
  }, []);
  
  const filteredSaccos = useMemo(() => {
    if (!saccoSearchTerm) {
        return saccoData;
    }
    const lowercasedFilter = saccoSearchTerm.toLowerCase();
    return saccoData.filter(sacco =>
        sacco.name.toLowerCase().includes(lowercasedFilter) ||
        sacco.location.toLowerCase().includes(lowercasedFilter)
    );
  }, [saccoSearchTerm]);

  const validateField = (name: keyof RiderProfile, value: string): string => {
      if (name === 'motorbikeReg') {
          // Kenyan license plate format: KXX 123X. Allows for an optional space. Case-insensitive.
          const kenyanPlateRegex = /^K[A-Z]{2}\s?\d{3}[A-Z]$/i;
          if (value && !kenyanPlateRegex.test(value)) {
              return 'Invalid format. Use a format like KMC 123D.';
          }
      }
      return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // FIX: Assert name as keyof RiderProfile to maintain strong typing on the profile state object.
    setProfile(prev => ({ ...prev, [name as keyof RiderProfile]: value }));
     if (errors[name as keyof RiderProfile]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name as keyof RiderProfile];
            return newErrors;
        });
    }
  };

   const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const error = validateField(name as keyof RiderProfile, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({
          ...prev,
          // FIX: Assert name as keyof RiderProfile to maintain strong typing on the profile state object.
          [name as keyof RiderProfile]: reader.result as string,
          ...(name === 'ntsaCertificate' && { ntsaCertificateName: file.name }),
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const regError = validateField('motorbikeReg', profile.motorbikeReg);
    if (regError) {
        setErrors({ motorbikeReg: regError });
        return;
    }

    try {
      localStorage.setItem('boda-rider-profile', JSON.stringify(profile));

      // Automatically add insurance reminder
      if (profile.insuranceExpiry) {
        const expiryDate = new Date(profile.insuranceExpiry);
        if (!isNaN(expiryDate.getTime())) {
            const reminderDate = new Date(expiryDate);
            reminderDate.setDate(reminderDate.getDate() - 14); // 2 weeks before expiry
            
            const newReminder: Reminder = {
                id: Date.now(),
                text: `Renew insurance (Policy: ${profile.insurancePolicyNo || 'N/A'})`,
                dateTime: reminderDate.toISOString()
            };

            const storedReminders = localStorage.getItem('boda-reminders') || '[]';
            const reminders: Reminder[] = JSON.parse(storedReminders);
            
            // Avoid duplicate reminders for the same policy
            const reminderExists = reminders.some(r => r.text.includes(profile.insurancePolicyNo));
            if (!reminderExists) {
                const updatedReminders = [...reminders, newReminder].sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
                localStorage.setItem('boda-reminders', JSON.stringify(updatedReminders));
            }
        }
      }

      alert('Profile saved successfully!');
      onClose();
    } catch (error) {
      console.error("Failed to save profile", error);
      alert('There was an error saving your profile.');
    }
  };
  
  // A11y: Focus trap and escape key handling
  useEffect(() => {
    const modalNode = modalRef.current;
    if (!modalNode) return;

    const focusableElements = modalNode.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
        triggerRef.current?.focus();
    };
  }, [onClose, triggerRef]);

  const renderInputField = (id: keyof RiderProfile, label: string, type: string, placeholder: string, required = true) => (
    <div>
        <label htmlFor={id} className="text-sm font-bold text-slate-300 block mb-2">{label}</label>
        {/* FIX: Ensure value is always a string by adding a fallback to an empty string to fix type error. */}
        <input type={type} id={id} name={id} value={profile[id] || ''} onChange={handleInputChange} placeholder={placeholder} required={required} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-green" />
    </div>
  );

  return (
    <div ref={modalRef} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col">
        <header className="flex-shrink-0 p-6 border-b border-slate-700 flex justify-between items-center">
            <h2 id={titleId} className="text-2xl font-bold flex items-center gap-3">
                <IdentificationIcon className="w-7 h-7 text-brand-green" />
                Rider Profile & Compliance
            </h2>
            <button onClick={onClose} aria-label="Close Rider Profile">
                <XCircleIcon className="w-8 h-8 text-slate-400 hover:text-brand-red" />
            </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                     <div className="flex flex-col items-center">
                        <label htmlFor="passportPhoto" className="cursor-pointer">
                            <div className="w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center border-2 border-dashed border-slate-500 hover:border-brand-green transition-colors">
                                {profile.passportPhoto ? (
                                    <img src={profile.passportPhoto} alt="Passport Photo Preview" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="text-center text-slate-400">
                                        <CameraIcon className="w-10 h-10 mx-auto" />
                                        <span className="text-xs">Upload Photo</span>
                                    </div>
                                )}
                            </div>
                        </label>
                        <input type="file" id="passportPhoto" name="passportPhoto" accept="image/*" className="sr-only" onChange={handleFileChange} />
                    </div>
                    {renderInputField('fullName', 'Full Name', 'text', 'e.g., John Kamau')}
                    {renderInputField('phoneNumber', 'Phone Number', 'tel', 'e.g., 0712345678')}
                </div>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {renderInputField('idNumber', 'ID/Passport No.', 'text', 'e.g., 12345678')}
                    {renderInputField('operatingArea', 'Stage/Operating Area', 'text', 'e.g., Westlands')}
                    <div>
                        <label htmlFor="motorbikeReg" className="text-sm font-bold text-slate-300 block mb-2">Motorbike Registration</label>
                        <input
                            type="text"
                            id="motorbikeReg"
                            name="motorbikeReg"
                            value={profile.motorbikeReg || ''}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder="e.g., KMC D123X"
                            required
                            className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-green ${errors.motorbikeReg ? 'border-red-500' : 'border-slate-600'}`}
                            aria-invalid={!!errors.motorbikeReg}
                            aria-describedby="motorbikeReg-error"
                        />
                        {errors.motorbikeReg && <p id="motorbikeReg-error" className="text-red-500 text-xs mt-1">{errors.motorbikeReg}</p>}
                    </div>
                    {renderInputField('drivingLicenceNo', 'Driving Licence No.', 'text', 'e.g., 987654')}
                    {renderInputField('licenceClass', 'Licence Class', 'text', 'e.g., A2, A3')}
                    <div>
                        <label htmlFor="saccoName" className="text-sm font-bold text-slate-300 block mb-2">Sacco/Group Membership</label>
                        <input
                            type="search"
                            id="sacco-search"
                            placeholder="Search for a SACCO by name or location..."
                            value={saccoSearchTerm}
                            onChange={(e) => setSaccoSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-green mb-2"
                        />
                        <select id="saccoName" name="saccoName" value={profile.saccoName} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-green">
                            <option value="">Select a SACCO</option>
                            {filteredSaccos.length > 0 ? (
                                filteredSaccos.map(sacco => <option key={sacco.id} value={sacco.name}>{sacco.name}</option>)
                            ) : (
                                <option value="" disabled>No SACCOs found</option>
                            )}
                        </select>
                    </div>
                    {renderInputField('saccoMembershipNo', 'Sacco Membership No.', 'text', 'e.g., S-10234')}
                    {renderInputField('insurancePolicyNo', 'Insurance Policy No.', 'text', 'e.g., POL-998877')}
                    {renderInputField('insuranceExpiry', 'Insurance Expiry Date', 'date', '')}
                    <div>
                        <label htmlFor="ntsaCertificate" className="text-sm font-bold text-slate-300 block mb-2">NTSA Training Certificate</label>
                        <div className="flex items-center">
                            <label htmlFor="ntsaCertificate" className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white hover:bg-slate-600">
                               <DocumentTextIcon className="w-6 h-6 text-slate-400" />
                               <span className="truncate">{profile.ntsaCertificateName || 'Click to upload certificate'}</span>
                            </label>
                            <input type="file" id="ntsaCertificate" name="ntsaCertificate" className="sr-only" onChange={handleFileChange} />
                        </div>
                    </div>
                </div>
            </div>
             <footer className="flex-shrink-0 mt-6 pt-6 border-t border-slate-700 text-right">
                <button type="submit" className="px-6 py-3 bg-brand-red text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300">
                    Save Profile
                </button>
            </footer>
        </form>
      </div>
    </div>
  );
};

export default RiderProfile;