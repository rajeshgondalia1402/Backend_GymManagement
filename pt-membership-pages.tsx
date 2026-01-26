/*
 * PT Membership Pages - Add & Edit
 * 
 * Separate page components for Add/Edit PT Membership instead of dialog boxes
 * Mobile-first responsive design for better user experience
 * 
 * Features:
 * - Dedicated Add PT Membership page
 * - Dedicated Edit PT Membership page  
 * - Mobile-responsive design with clean UI
 * - Form validation with Zod + React Hook Form
 * - Searchable member and trainer dropdowns
 * - Back navigation with confirmation
 * - Success/error toast notifications
 * 
 * Backend Integration:
 * - POST /api/v1/gym-owner/pt-members (Create)
 * - PUT /api/v1/gym-owner/pt-members/:id (Update)
 * - GET /api/v1/gym-owner/pt-members/:id (Get by ID)
 * - GET /api/v1/gym-owner/members (Member list)
 * - GET /api/v1/gym-owner/trainers (Trainer list)
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Target,
  Clock,
  FileText,
  Dumbbell,
  Save,
  X,
  Search,
  ChevronDown
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PTMember {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  trainerId: string;
  trainerName: string;
  packageName: string;
  sessionsTotal: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  sessionDuration: number;
  startDate: string;
  endDate?: string;
  goals?: string;
  notes?: string;
  isActive: boolean;
  gymId: string;
  createdAt: string;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
}

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization?: string;
  isActive: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createPTMemberSchema = z.object({
  memberId: z.string().uuid('Please select a member'),
  trainerId: z.string().uuid('Please select a trainer'),
  packageName: z.string().min(2, 'Package name must be at least 2 characters'),
  sessionsTotal: z.number({
    required_error: 'Total sessions is required',
    invalid_type_error: 'Sessions must be a number',
  }).int().positive('Sessions must be greater than 0'),
  sessionDuration: z.number().int().positive().optional().default(60),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  goals: z.string().max(1000, 'Goals must be less than 1000 characters').optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
});

const updatePTMemberSchema = z.object({
  trainerId: z.string().uuid('Please select a trainer').optional(),
  packageName: z.string().min(2, 'Package name must be at least 2 characters').optional(),
  sessionsTotal: z.number().int().positive('Sessions must be greater than 0').optional(),
  sessionsUsed: z.number().int().min(0, 'Sessions used cannot be negative').optional(),
  sessionDuration: z.number().int().positive().optional(),
  endDate: z.string().optional(),
  goals: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
  isActive: z.boolean().optional(),
});

type CreatePTMemberFormData = z.infer<typeof createPTMemberSchema>;
type UpdatePTMemberFormData = z.infer<typeof updatePTMemberSchema>;

// ============================================================================
// API SERVICE
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  }
  return null;
};

class PTMemberApi {
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  static async getById(id: string): Promise<ApiResponse<PTMember>> {
    const response = await fetch(`${API_BASE_URL}/gym-owner/pt-members/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch PT member' }));
      throw new Error(error.message || 'Failed to fetch PT member');
    }

    return await response.json();
  }

  static async create(data: CreatePTMemberFormData): Promise<ApiResponse<PTMember>> {
    const response = await fetch(`${API_BASE_URL}/gym-owner/pt-members`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create PT membership' }));
      throw new Error(error.message || 'Failed to create PT membership');
    }

    return await response.json();
  }

  static async update(id: string, data: UpdatePTMemberFormData): Promise<ApiResponse<PTMember>> {
    const response = await fetch(`${API_BASE_URL}/gym-owner/pt-members/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update PT membership' }));
      throw new Error(error.message || 'Failed to update PT membership');
    }

    return await response.json();
  }

  static async getMembers(search?: string): Promise<ApiResponse<Member[]>> {
    const params = new URLSearchParams({ limit: '100' });
    if (search) params.append('search', search);

    const response = await fetch(`${API_BASE_URL}/gym-owner/members?${params}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch members');
    }

    return await response.json();
  }

  static async getTrainers(search?: string): Promise<ApiResponse<Trainer[]>> {
    const params = new URLSearchParams({ limit: '100' });
    if (search) params.append('search', search);

    const response = await fetch(`${API_BASE_URL}/gym-owner/trainers?${params}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trainers');
    }

    return await response.json();
  }
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

// Toast Notification
const Toast: React.FC<{ 
  message: string; 
  type: 'success' | 'error'; 
  onClose: () => void 
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={`
        fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md flex items-start gap-3
        animate-slide-in
        ${type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}
      `}
    >
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <p className={`text-sm font-medium ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
          {message}
        </p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <XCircle className="w-5 h-5" />
      </button>
    </div>
  );
};

// Loading Spinner
const LoadingSpinner: React.FC<{ message?: string; fullPage?: boolean }> = ({ 
  message = 'Loading...', 
  fullPage = false 
}) => (
  <div className={`flex flex-col items-center justify-center ${fullPage ? 'min-h-screen' : 'py-12'}`}>
    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
    <p className="text-sm text-gray-600">{message}</p>
  </div>
);

// Page Header with Back Button
const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel?: string;
}> = ({ title, subtitle, onBack, backLabel = 'Back' }) => (
  <div className="mb-6 md:mb-8">
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm font-medium">{backLabel}</span>
    </button>
    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
    {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
  </div>
);

// Form Field Wrapper
const FormField: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  hint?: string;
}> = ({ label, required, error, children, icon, hint }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      {icon && <span className="text-gray-400">{icon}</span>}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    {error && <p className="text-sm text-red-600 flex items-center gap-1">
      <AlertCircle className="w-4 h-4" />
      {error}
    </p>}
  </div>
);

// Searchable Select Component
const SearchableSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; sublabel?: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string;
  isLoading?: boolean;
}> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...', 
  searchPlaceholder = 'Search...',
  disabled,
  error,
  isLoading
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 text-left bg-white border rounded-lg flex items-center justify-between
          transition-all duration-200
          ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
          ${disabled || isLoading ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}
          focus:outline-none focus:ring-2 focus:ring-offset-0
        `}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {isLoading ? 'Loading...' : (selectedOption?.label || placeholder)}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No results found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors
                      ${option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                    `}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    {option.sublabel && (
                      <div className="text-xs text-gray-500 mt-0.5">{option.sublabel}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Toggle Switch
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}> = ({ checked, onChange, disabled, label }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${checked ? 'bg-blue-600' : 'bg-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
    {label && <span className="text-sm text-gray-700">{label}</span>}
  </label>
);

// ============================================================================
// ADD PT MEMBERSHIP PAGE
// ============================================================================

export const AddPTMembershipPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedMemberId = searchParams?.get('memberId');

  const [members, setMembers] = useState<Member[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingTrainers, setIsLoadingTrainers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmBack, setShowConfirmBack] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreatePTMemberFormData>({
    resolver: zodResolver(createPTMemberSchema),
    defaultValues: {
      memberId: preselectedMemberId || '',
      trainerId: '',
      packageName: '',
      sessionsTotal: 12,
      sessionDuration: 60,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      goals: '',
      notes: '',
    },
  });

  // Load members and trainers
  useEffect(() => {
    const loadData = async () => {
      try {
        const [membersRes, trainersRes] = await Promise.all([
          PTMemberApi.getMembers(),
          PTMemberApi.getTrainers(),
        ]);
        setMembers(membersRes.data || []);
        setTrainers(trainersRes.data || []);
      } catch (error) {
        console.error('Failed to load data:', error);
        setToast({ message: 'Failed to load members and trainers', type: 'error' });
      } finally {
        setIsLoadingMembers(false);
        setIsLoadingTrainers(false);
      }
    };

    loadData();
  }, []);

  const handleBack = () => {
    if (isDirty) {
      setShowConfirmBack(true);
    } else {
      router.back();
    }
  };

  const onSubmit = async (data: CreatePTMemberFormData) => {
    setIsSubmitting(true);
    try {
      const response = await PTMemberApi.create(data);
      setToast({ message: response.message || 'PT Membership created successfully!', type: 'success' });
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/gym-owner/pt-members');
      }, 1500);
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to create PT membership', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const memberOptions = members.map(m => ({
    value: m.id,
    label: `${m.firstName} ${m.lastName}`,
    sublabel: m.email || m.phone,
  }));

  const trainerOptions = trainers.map(t => ({
    value: t.id,
    label: `${t.firstName} ${t.lastName}`,
    sublabel: t.specialization || t.email,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmBack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Discard Changes?</h3>
            <p className="text-sm text-gray-600 mb-6">
              You have unsaved changes. Are you sure you want to go back?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmBack(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Stay
              </button>
              <button
                onClick={() => router.back()}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
        <PageHeader
          title="Add PT Membership"
          subtitle="Create a new personal training membership for a member"
          onBack={handleBack}
          backLabel="Back to PT Members"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Member & Trainer Selection Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Member & Trainer
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Select Member"
                required
                error={errors.memberId?.message}
                icon={<User className="w-4 h-4" />}
              >
                <Controller
                  name="memberId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={memberOptions}
                      placeholder="Search and select member..."
                      searchPlaceholder="Search by name or email..."
                      isLoading={isLoadingMembers}
                      error={errors.memberId?.message}
                    />
                  )}
                />
              </FormField>

              <FormField
                label="Assign Trainer"
                required
                error={errors.trainerId?.message}
                icon={<Dumbbell className="w-4 h-4" />}
              >
                <Controller
                  name="trainerId"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={trainerOptions}
                      placeholder="Search and select trainer..."
                      searchPlaceholder="Search by name..."
                      isLoading={isLoadingTrainers}
                      error={errors.trainerId?.message}
                    />
                  )}
                />
              </FormField>
            </div>
          </div>

          {/* Package Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Package Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Package Name"
                required
                error={errors.packageName?.message}
              >
                <input
                  type="text"
                  {...register('packageName')}
                  placeholder="e.g., Basic PT Package, Premium Training"
                  className={`
                    w-full px-4 py-3 border rounded-lg transition-all
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${errors.packageName ? 'border-red-300' : 'border-gray-300'}
                  `}
                />
              </FormField>

              <FormField
                label="Total Sessions"
                required
                error={errors.sessionsTotal?.message}
                hint="Number of PT sessions in this package"
              >
                <input
                  type="number"
                  {...register('sessionsTotal', { valueAsNumber: true })}
                  min={1}
                  placeholder="e.g., 12"
                  className={`
                    w-full px-4 py-3 border rounded-lg transition-all
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${errors.sessionsTotal ? 'border-red-300' : 'border-gray-300'}
                  `}
                />
              </FormField>

              <FormField
                label="Session Duration (minutes)"
                error={errors.sessionDuration?.message}
                hint="Duration of each PT session"
              >
                <select
                  {...register('sessionDuration', { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes (1 hour)</option>
                  <option value={90}>90 minutes (1.5 hours)</option>
                  <option value={120}>120 minutes (2 hours)</option>
                </select>
              </FormField>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Schedule
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Start Date"
                error={errors.startDate?.message}
              >
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>

              <FormField
                label="End Date"
                error={errors.endDate?.message}
                hint="Optional - Leave blank for no expiry"
              >
                <input
                  type="date"
                  {...register('endDate')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
            </div>
          </div>

          {/* Goals & Notes Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Goals & Notes
            </h2>

            <div className="space-y-6">
              <FormField
                label="Fitness Goals"
                error={errors.goals?.message}
                hint="What does the member want to achieve?"
              >
                <textarea
                  {...register('goals')}
                  rows={3}
                  placeholder="e.g., Weight loss, muscle building, improve stamina..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </FormField>

              <FormField
                label="Additional Notes"
                error={errors.notes?.message}
                hint="Any special requirements or information"
              >
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="e.g., Medical conditions, preferred training times..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </FormField>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create PT Membership
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// EDIT PT MEMBERSHIP PAGE
// ============================================================================

export const EditPTMembershipPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const ptMemberId = params?.id as string;

  const [ptMember, setPTMember] = useState<PTMember | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTrainers, setIsLoadingTrainers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmBack, setShowConfirmBack] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdatePTMemberFormData>({
    resolver: zodResolver(updatePTMemberSchema),
  });

  const sessionsTotal = watch('sessionsTotal');
  const sessionsUsed = watch('sessionsUsed');

  // Load PT Member data
  useEffect(() => {
    const loadData = async () => {
      if (!ptMemberId) {
        setToast({ message: 'Invalid PT Member ID', type: 'error' });
        setIsLoading(false);
        return;
      }

      try {
        const [ptMemberRes, trainersRes] = await Promise.all([
          PTMemberApi.getById(ptMemberId),
          PTMemberApi.getTrainers(),
        ]);

        const ptData = ptMemberRes.data;
        setPTMember(ptData);
        setTrainers(trainersRes.data || []);

        // Reset form with loaded data
        reset({
          trainerId: ptData.trainerId,
          packageName: ptData.packageName,
          sessionsTotal: ptData.sessionsTotal,
          sessionsUsed: ptData.sessionsUsed,
          sessionDuration: ptData.sessionDuration,
          endDate: ptData.endDate ? format(new Date(ptData.endDate), 'yyyy-MM-dd') : '',
          goals: ptData.goals || '',
          notes: ptData.notes || '',
          isActive: ptData.isActive,
        });
      } catch (error: any) {
        setToast({ message: error.message || 'Failed to load PT membership', type: 'error' });
      } finally {
        setIsLoading(false);
        setIsLoadingTrainers(false);
      }
    };

    loadData();
  }, [ptMemberId, reset]);

  const handleBack = () => {
    if (isDirty) {
      setShowConfirmBack(true);
    } else {
      router.back();
    }
  };

  const onSubmit = async (data: UpdatePTMemberFormData) => {
    setIsSubmitting(true);
    try {
      const response = await PTMemberApi.update(ptMemberId, data);
      setToast({ message: response.message || 'PT Membership updated successfully!', type: 'success' });
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/gym-owner/pt-members');
      }, 1500);
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to update PT membership', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const trainerOptions = trainers.map(t => ({
    value: t.id,
    label: `${t.firstName} ${t.lastName}`,
    sublabel: t.specialization || t.email,
  }));

  if (isLoading) {
    return <LoadingSpinner message="Loading PT membership details..." fullPage />;
  }

  if (!ptMember) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">PT Membership Not Found</h2>
          <p className="text-gray-600 mb-6">The PT membership you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => router.push('/gym-owner/pt-members')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to PT Members
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmBack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Discard Changes?</h3>
            <p className="text-sm text-gray-600 mb-6">
              You have unsaved changes. Are you sure you want to go back?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmBack(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Stay
              </button>
              <button
                onClick={() => router.back()}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
        <PageHeader
          title="Edit PT Membership"
          subtitle={`Editing membership for ${ptMember.memberName}`}
          onBack={handleBack}
          backLabel="Back to PT Members"
        />

        {/* Member Info Card (Read-only) */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {ptMember.memberName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{ptMember.memberName}</h3>
              <p className="text-sm text-gray-600">{ptMember.memberEmail}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-sm border border-gray-200">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  Started: {format(new Date(ptMember.startDate), 'MMM dd, yyyy')}
                </span>
                <span className={`
                  inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm
                  ${ptMember.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                `}>
                  {ptMember.isActive ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {ptMember.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Trainer Assignment Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-600" />
              Trainer Assignment
            </h2>

            <FormField
              label="Assigned Trainer"
              error={errors.trainerId?.message}
              hint="Change the trainer assigned to this membership"
            >
              <Controller
                name="trainerId"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value || ''}
                    onChange={field.onChange}
                    options={trainerOptions}
                    placeholder="Search and select trainer..."
                    searchPlaceholder="Search by name..."
                    isLoading={isLoadingTrainers}
                    error={errors.trainerId?.message}
                  />
                )}
              />
            </FormField>
          </div>

          {/* Package Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Package Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Package Name"
                error={errors.packageName?.message}
              >
                <input
                  type="text"
                  {...register('packageName')}
                  placeholder="e.g., Basic PT Package"
                  className={`
                    w-full px-4 py-3 border rounded-lg transition-all
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${errors.packageName ? 'border-red-300' : 'border-gray-300'}
                  `}
                />
              </FormField>

              <FormField
                label="Session Duration (minutes)"
                error={errors.sessionDuration?.message}
              >
                <select
                  {...register('sessionDuration', { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes (1 hour)</option>
                  <option value={90}>90 minutes (1.5 hours)</option>
                  <option value={120}>120 minutes (2 hours)</option>
                </select>
              </FormField>
            </div>
          </div>

          {/* Sessions Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Sessions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                label="Total Sessions"
                error={errors.sessionsTotal?.message}
              >
                <input
                  type="number"
                  {...register('sessionsTotal', { valueAsNumber: true })}
                  min={1}
                  className={`
                    w-full px-4 py-3 border rounded-lg transition-all
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${errors.sessionsTotal ? 'border-red-300' : 'border-gray-300'}
                  `}
                />
              </FormField>

              <FormField
                label="Sessions Used"
                error={errors.sessionsUsed?.message}
              >
                <input
                  type="number"
                  {...register('sessionsUsed', { valueAsNumber: true })}
                  min={0}
                  className={`
                    w-full px-4 py-3 border rounded-lg transition-all
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${errors.sessionsUsed ? 'border-red-300' : 'border-gray-300'}
                  `}
                />
              </FormField>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Sessions Remaining</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className={`text-lg font-semibold ${
                    (sessionsTotal || 0) - (sessionsUsed || 0) <= 2 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {(sessionsTotal || 0) - (sessionsUsed || 0)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">remaining</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Session Progress</span>
                <span>{Math.round(((sessionsUsed || 0) / (sessionsTotal || 1)) * 100)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    ((sessionsUsed || 0) / (sessionsTotal || 1)) >= 0.9 ? 'bg-red-500' :
                    ((sessionsUsed || 0) / (sessionsTotal || 1)) >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(((sessionsUsed || 0) / (sessionsTotal || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Schedule
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {format(new Date(ptMember.startDate), 'MMMM dd, yyyy')}
                </div>
                <p className="text-xs text-gray-500">Start date cannot be changed</p>
              </div>

              <FormField
                label="End Date"
                error={errors.endDate?.message}
                hint="Leave blank for no expiry"
              >
                <input
                  type="date"
                  {...register('endDate')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
            </div>
          </div>

          {/* Goals & Notes Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Goals & Notes
            </h2>

            <div className="space-y-6">
              <FormField
                label="Fitness Goals"
                error={errors.goals?.message}
              >
                <textarea
                  {...register('goals')}
                  rows={3}
                  placeholder="e.g., Weight loss, muscle building..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </FormField>

              <FormField
                label="Additional Notes"
                error={errors.notes?.message}
              >
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Any special requirements..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </FormField>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Membership Status</h2>
            
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <ToggleSwitch
                  checked={field.value || false}
                  onChange={field.onChange}
                  label={field.value ? 'Membership is Active' : 'Membership is Inactive'}
                />
              )}
            />
            
            <p className="mt-3 text-sm text-gray-500">
              {watch('isActive') 
                ? 'The member can access PT services and use sessions.'
                : 'The member will not be able to use PT sessions while inactive.'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// PT MEMBERSHIP LIST PAGE (with navigation to Add/Edit pages)
// ============================================================================

export const PTMembershipListPage: React.FC = () => {
  const router = useRouter();
  const [ptMembers, setPTMembers] = useState<PTMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadPTMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        search: searchQuery,
      });

      const response = await fetch(`${API_BASE_URL}/gym-owner/pt-members?${params}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch PT members');

      const data = await response.json();
      setPTMembers(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to load PT members', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    loadPTMembers();
  }, [loadPTMembers]);

  const handleAddNew = () => {
    router.push('/gym-owner/pt-members/add');
  };

  const handleEdit = (id: string) => {
    router.push(`/gym-owner/pt-members/${id}/edit`);
  };

  const handleViewDetails = (id: string) => {
    router.push(`/gym-owner/pt-members/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">PT Memberships</h1>
            <p className="text-sm text-gray-600 mt-1">Manage personal training memberships</p>
          </div>
          
          <button
            onClick={handleAddNew}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Dumbbell className="w-5 h-5" />
            Add PT Membership
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by member name, trainer, or package..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <LoadingSpinner message="Loading PT memberships..." />
        ) : ptMembers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No PT Memberships Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search query.' : 'Get started by adding your first PT membership.'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleAddNew}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Add PT Membership
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Member</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trainer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Package</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sessions</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ptMembers.map((pt) => (
                    <tr key={pt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{pt.memberName}</div>
                        <div className="text-sm text-gray-500">{pt.memberEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{pt.trainerName}</td>
                      <td className="px-6 py-4 text-gray-700">{pt.packageName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${pt.sessionsRemaining <= 2 ? 'text-red-600' : 'text-gray-900'}`}>
                            {pt.sessionsRemaining}
                          </span>
                          <span className="text-gray-500">/ {pt.sessionsTotal}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`
                          inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                          ${pt.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        `}>
                          {pt.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {pt.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(pt.id)}
                          className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {ptMembers.map((pt) => (
                <div 
                  key={pt.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{pt.memberName}</h3>
                      <p className="text-sm text-gray-500">{pt.memberEmail}</p>
                    </div>
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                      ${pt.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    `}>
                      {pt.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Trainer:</span>
                      <p className="font-medium text-gray-900">{pt.trainerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Package:</span>
                      <p className="font-medium text-gray-900">{pt.packageName}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Sessions:</span>
                      <span className={`ml-2 font-medium ${pt.sessionsRemaining <= 2 ? 'text-red-600' : 'text-gray-900'}`}>
                        {pt.sessionsRemaining} remaining
                      </span>
                      <span className="text-gray-500"> / {pt.sessionsTotal} total</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEdit(pt.id)}
                    className="w-full py-2.5 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  >
                    Edit Membership
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS & ROUTING SETUP
// ============================================================================

/*
 * File Structure for Next.js App Router:
 * 
 * app/
 * └── gym-owner/
 *     └── pt-members/
 *         ├── page.tsx           → PTMembershipListPage
 *         ├── add/
 *         │   └── page.tsx       → AddPTMembershipPage
 *         └── [id]/
 *             └── edit/
 *                 └── page.tsx   → EditPTMembershipPage
 * 
 * Usage:
 * 
 * // app/gym-owner/pt-members/page.tsx
 * import { PTMembershipListPage } from '@/components/pt-membership-pages';
 * export default PTMembershipListPage;
 * 
 * // app/gym-owner/pt-members/add/page.tsx
 * import { AddPTMembershipPage } from '@/components/pt-membership-pages';
 * export default AddPTMembershipPage;
 * 
 * // app/gym-owner/pt-members/[id]/edit/page.tsx
 * import { EditPTMembershipPage } from '@/components/pt-membership-pages';
 * export default EditPTMembershipPage;
 */

export default {
  AddPTMembershipPage,
  EditPTMembershipPage,
  PTMembershipListPage,
};
