/*
 * Admin Subscription Plans Page
 * 
 * A complete, responsive React + TypeScript page for managing gym subscription plans
 * Integrated with existing backend API structure
 * 
 * Features:
 * - Create/Update subscription plans with rich text editor
 * - Responsive data table with search, sort, pagination
 * - Multi-currency support (INR/USD)
 * - Toggle active/inactive status
 * - Mobile-first responsive design
 * - Form validation with Zod + React Hook Form
 * 
 * Backend Integration:
 * - Uses existing response format: { success, message, data, pagination }
 * - Matches GymSubscriptionPlan schema
 * - Integrates with auth middleware
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import {
  Search,
  Plus,
  Edit2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Dynamic import for Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// ============================================================================
// TYPES & SCHEMAS (Matching Backend)
// ============================================================================

type PlanCategory =
  | 'Basic / Entry-Level Plans'
  | 'Standard / Popular Plans'
  | 'Premium / Advanced Plans'
  | 'Duration-Based (Common in India)';

type Currency = 'INR' | 'USD';

// Backend GymSubscriptionPlan model
interface SubscriptionPlan {
  id: string;
  name: PlanCategory;
  description: string;
  priceCurrency: Currency;
  price: string | number; // Prisma Decimal as string
  durationDays: number;
  features: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    gyms: number;
  };
}

// Backend response format
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

const subscriptionPlanSchema = z.object({
  name: z.enum([
    'Basic / Entry-Level Plans',
    'Standard / Popular Plans',
    'Premium / Advanced Plans',
    'Duration-Based (Common in India)',
  ] as const, {
    required_error: 'Plan name is required',
  }),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description is too long'),
  priceCurrency: z.enum(['INR', 'USD'] as const, {
    required_error: 'Currency is required',
  }),
  price: z
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a number',
    })
    .positive('Price must be greater than 0')
    .max(999999, 'Price is too high'),
  durationDays: z
    .number({
      required_error: 'Duration is required',
      invalid_type_error: 'Duration must be a number',
    })
    .int('Duration must be a whole number')
    .positive('Duration must be greater than 0')
    .max(3650, 'Duration cannot exceed 10 years'),
  features: z
    .string()
    .min(10, 'Features must be at least 10 characters')
    .max(5000, 'Features list is too long'),
  isActive: z.boolean().default(true),
});

type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanSchema>;

// ============================================================================
// API SERVICE (Matches Backend Structure)
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Get auth token from your auth context/store
const getAuthToken = (): string | null => {
  // TODO: Replace with your actual auth implementation
  // Example: return localStorage.getItem('token');
  // Example: return useAuthStore.getState().token;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

class SubscriptionPlanApi {
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

  static async list(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<SubscriptionPlan[]>> {
    const queryParams = new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 10),
      search: params.search || '',
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc',
    });

    const response = await fetch(
      `${API_BASE_URL}/admin/subscription-plans?${queryParams}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch plans: ${response.statusText}`);
    }

    return await response.json();
  }

  static async create(data: SubscriptionPlanFormData): Promise<ApiResponse<SubscriptionPlan>> {
    const response = await fetch(`${API_BASE_URL}/admin/subscription-plans`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create plan' }));
      throw new Error(error.message || 'Failed to create plan');
    }

    return await response.json();
  }

  static async update(id: string, data: SubscriptionPlanFormData): Promise<ApiResponse<SubscriptionPlan>> {
    const response = await fetch(`${API_BASE_URL}/admin/subscription-plans/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update plan' }));
      throw new Error(error.message || 'Failed to update plan');
    }

    return await response.json();
  }

  static async toggleActive(id: string): Promise<ApiResponse<SubscriptionPlan>> {
    const response = await fetch(
      `${API_BASE_URL}/admin/subscription-plans/${id}/toggle-status`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to toggle status' }));
      throw new Error(error.message || 'Failed to toggle status');
    }

    return await response.json();
  }

  static async delete(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/admin/subscription-plans/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete plan' }));
      throw new Error(error.message || 'Failed to delete plan');
    }

    return await response.json();
  }
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
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
        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
        ${checked ? 'translate-x-6' : 'translate-x-1'}
      `}
    />
  </button>
);

const Badge: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    className={`
      inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
      ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
    `}
  >
    {active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
    {active ? 'Active' : 'Inactive'}
  </span>
);

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
    <p className="text-sm text-gray-600">{message}</p>
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
    <AlertCircle className="w-12 h-12 mb-3" />
    <p className="text-sm">{message}</p>
  </div>
);

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

// ============================================================================
// RICH TEXT EDITOR COMPONENT
// ============================================================================

const RichTextEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}> = ({ value, onChange, placeholder, error }) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );

  return (
    <div>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        className={`bg-white ${error ? 'border-red-500 rounded' : ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// ============================================================================
// SUBSCRIPTION PLAN FORM
// ============================================================================

interface SubscriptionPlanFormProps {
  editingPlan: SubscriptionPlan | null;
  onSuccess: (message: string) => void;
  onCancel: () => void;
}

const SubscriptionPlanForm: React.FC<SubscriptionPlanFormProps> = ({
  editingPlan,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubscriptionPlanFormData>({
    resolver: zodResolver(subscriptionPlanSchema),
    defaultValues: {
      name: 'Basic / Entry-Level Plans',
      description: '',
      priceCurrency: 'INR',
      price: 0,
      durationDays: 30,
      features: '',
      isActive: true,
    },
  });

  const selectedCurrency = watch('priceCurrency');

  useEffect(() => {
    if (editingPlan) {
      reset({
        name: editingPlan.name,
        description: editingPlan.description,
        priceCurrency: editingPlan.priceCurrency,
        price: Number(editingPlan.price),
        durationDays: editingPlan.durationDays,
        features: editingPlan.features,
        isActive: editingPlan.isActive,
      });
    }
  }, [editingPlan, reset]);

  const onSubmit = async (data: SubscriptionPlanFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let response: ApiResponse<SubscriptionPlan>;
      
      if (editingPlan) {
        response = await SubscriptionPlanApi.update(editingPlan.id, data);
      } else {
        response = await SubscriptionPlanApi.create(data);
      }
      
      reset();
      onSuccess(response.message || `Subscription plan ${editingPlan ? 'updated' : 'created'} successfully`);
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    onCancel();
    setSubmitError(null);
  };

  const currencySymbol = selectedCurrency === 'INR' ? '₹' : '$';
  const currencyPlaceholder = selectedCurrency === 'INR' ? 'e.g., 999' : 'e.g., 9.99';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {editingPlan ? 'Update Subscription Plan' : 'Create Subscription Plan'}
        </h2>
        {editingPlan && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Plan Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan Name <span className="text-red-500">*</span>
          </label>
          <select
            {...register('name')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Basic / Entry-Level Plans">Basic / Entry-Level Plans</option>
            <option value="Standard / Popular Plans">Standard / Popular Plans</option>
            <option value="Premium / Advanced Plans">Premium / Advanced Plans</option>
            <option value="Duration-Based (Common in India)">Duration-Based (Common in India)</option>
          </select>
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Enter plan description..."
                error={errors.description?.message}
              />
            )}
          />
        </div>

        {/* Price Currency & Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  {...register('priceCurrency')}
                  value="INR"
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">INR (₹)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  {...register('priceCurrency')}
                  value="USD"
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">USD ($)</span>
              </label>
            </div>
            {errors.priceCurrency && (
              <p className="mt-1 text-sm text-red-600">{errors.priceCurrency.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ({currencySymbol}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              placeholder={currencyPlaceholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (Days) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register('durationDays', { valueAsNumber: true })}
            placeholder="e.g., 30, 90, 180, 365"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.durationDays && (
            <p className="mt-1 text-sm text-red-600">{errors.durationDays.message}</p>
          )}
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Features <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Use bullet points for better formatting
          </p>
          <Controller
            name="features"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="<ul><li>Feature 1</li><li>Feature 2</li></ul>"
                error={errors.features?.message}
              />
            )}
          />
        </div>

        {/* Is Active */}
        <div className="flex items-center gap-3">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <ToggleSwitch checked={field.value} onChange={field.onChange} />
            )}
          />
          <label className="text-sm font-medium text-gray-700">Active Status</label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {editingPlan ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================================================
// SUBSCRIPTION PLANS TABLE
// ============================================================================

interface SubscriptionPlansTableProps {
  onEdit: (plan: SubscriptionPlan) => void;
  onSuccess: (message: string) => void;
  refreshTrigger: number;
}

const SubscriptionPlansTable: React.FC<SubscriptionPlansTableProps> = ({ 
  onEdit, 
  onSuccess,
  refreshTrigger 
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const pageSize = 10;

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const result = await SubscriptionPlanApi.list({
        page,
        limit: pageSize,
        search,
        sortBy,
        sortOrder,
      });
      
      setPlans(result.data);
      if (result.pagination) {
        setTotalPages(result.pagination.totalPages);
        setTotal(result.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans, refreshTrigger]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      const response = await SubscriptionPlanApi.toggleActive(plan.id);
      onSuccess(response.message || `Plan ${plan.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchPlans();
    } catch (error: any) {
      onSuccess(error.message || 'Failed to toggle status');
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Subscription Plans</h2>
            {total > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Total: {total} plan{total !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by plan name or duration..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-80 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Plan Name
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Price
                  <SortIcon field="price" />
                </div>
              </th>
              <th
                onClick={() => handleSort('durationDays')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Duration
                  <SortIcon field="durationDays" />
                </div>
              </th>
              <th
                onClick={() => handleSort('isActive')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon field="isActive" />
                </div>
              </th>
              <th
                onClick={() => handleSort('createdAt')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Created
                  <SortIcon field="createdAt" />
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <LoadingSpinner />
                </td>
              </tr>
            ) : plans.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState message="No subscription plans found" />
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                    {plan._count && plan._count.gyms > 0 && (
                      <div className="text-xs text-gray-500">{plan._count.gyms} gym{plan._count.gyms !== 1 ? 's' : ''}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {plan.priceCurrency === 'INR' ? '₹' : '$'}
                      {Number(plan.price).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{plan.durationDays} days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge active={plan.isActive} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(plan.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(plan)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(plan)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          plan.isActive
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {plan.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table - Mobile (Card Layout) */}
      <div className="md:hidden">
        {loading ? (
          <LoadingSpinner />
        ) : plans.length === 0 ? (
          <EmptyState message="No subscription plans found" />
        ) : (
          <div className="divide-y divide-gray-200">
            {plans.map((plan) => (
              <div key={plan.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{plan.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(plan.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge active={plan.isActive} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <span className="ml-1 font-medium">
                      {plan.priceCurrency === 'INR' ? '₹' : '$'}
                      {Number(plan.price).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-1 font-medium">{plan.durationDays} days</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(plan)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                      plan.isActive
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {plan.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && plans.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function SubscriptionPlansPage() {
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSuccess = (message: string) => {
    setEditingPlan(null);
    setRefreshKey((k) => k + 1);
    setToast({ message, type: 'success' });
  };

  const handleCancel = () => {
    setEditingPlan(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage gym subscription plans with flexible pricing and features
          </p>
        </div>

        {/* Form */}
        <SubscriptionPlanForm
          editingPlan={editingPlan}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />

        {/* Table */}
        <SubscriptionPlansTable 
          key={refreshKey} 
          onEdit={setEditingPlan} 
          onSuccess={handleSuccess}
          refreshTrigger={refreshKey}
        />
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

const subscriptionPlanSchema = z.object({
  name: z.enum([
    'Basic / Entry-Level Plans',
    'Standard / Popular Plans',
    'Premium / Advanced Plans',
    'Duration-Based (Common in India)',
  ] as const, {
    required_error: 'Plan name is required',
  }),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description is too long'),
  priceCurrency: z.enum(['INR', 'USD'] as const, {
    required_error: 'Currency is required',
  }),
  price: z
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a number',
    })
    .positive('Price must be greater than 0')
    .max(999999, 'Price is too high'),
  durationDays: z
    .number({
      required_error: 'Duration is required',
      invalid_type_error: 'Duration must be a number',
    })
    .int('Duration must be a whole number')
    .positive('Duration must be greater than 0')
    .max(3650, 'Duration cannot exceed 10 years'),
  features: z
    .string()
    .min(10, 'Features must be at least 10 characters')
    .max(5000, 'Features list is too long'),
  isActive: z.boolean().default(true),
});

type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanSchema>;

// ============================================================================
// API SERVICE (Matches Backend Structure)
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Get auth token from your auth context/store
const getAuthToken = (): string | null => {
  // TODO: Replace with your actual auth implementation
  // Example: return localStorage.getItem('token');
  // Example: return useAuthStore.getState().token;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

class SubscriptionPlanApi {
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

  static async list(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<SubscriptionPlan[]>> {
    const queryParams = new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 10),
      search: params.search || '',
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc',
    });

    const response = await fetch(
      `${API_BASE_URL}/admin/subscription-plans?${queryParams}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch plans: ${response.statusText}`);
    }

    return await response.json();
  }

  static async create(data: SubscriptionPlanFormData): Promise<ApiResponse<SubscriptionPlan>> {
    const response = await fetch(`${API_BASE_URL}/admin/subscription-plans`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create plan' }));
      throw new Error(error.message || 'Failed to create plan');
    }

    return await response.json();
  }

  static async update(id: string, data: SubscriptionPlanFormData): Promise<ApiResponse<SubscriptionPlan>> {
    const response = await fetch(`${API_BASE_URL}/admin/subscription-plans/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update plan' }));
      throw new Error(error.message || 'Failed to update plan');
    }

    return await response.json();
  }

  static async toggleActive(id: string): Promise<ApiResponse<SubscriptionPlan>> {
    const response = await fetch(
      `${API_BASE_URL}/admin/subscription-plans/${id}/toggle-status`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to toggle status' }));
      throw new Error(error.message || 'Failed to toggle status');
    }

    return await response.json();
  }

  static async delete(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/admin/subscription-plans/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete plan' }));
      throw new Error(error.message || 'Failed to delete plan');
    }

    return await response.json();
  }
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
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
        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
        ${checked ? 'translate-x-6' : 'translate-x-1'}
      `}
    />
  </button>
);

const Badge: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    className={`
      inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
      ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
    `}
  >
    {active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
    {active ? 'Active' : 'Inactive'}
  </span>
);

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
    <p className="text-sm text-gray-600">{message}</p>
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
    <AlertCircle className="w-12 h-12 mb-3" />
    <p className="text-sm">{message}</p>
  </div>
);

// ============================================================================
// RICH TEXT EDITOR COMPONENT
// ============================================================================

const RichTextEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}> = ({ value, onChange, placeholder, error }) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );

  return (
    <div>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        className={`bg-white ${error ? 'border-red-500 rounded' : ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// ============================================================================
// SUBSCRIPTION PLAN FORM
// ============================================================================

interface SubscriptionPlanFormProps {
  editingPlan: SubscriptionPlan | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const SubscriptionPlanForm: React.FC<SubscriptionPlanFormProps> = ({
  editingPlan,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubscriptionPlanFormData>({
    resolver: zodResolver(subscriptionPlanSchema),
    defaultValues: {
      name: 'Basic / Entry-Level Plans',
      description: '',
      priceCurrency: 'INR',
      price: 0,
      durationDays: 30,
      features: '',
      isActive: true,
    },
  });

  const selectedCurrency = watch('priceCurrency');

  useEffect(() => {
    if (editingPlan) {
      reset({
        name: editingPlan.name,
        description: editingPlan.description,
        priceCurrency: editingPlan.priceCurrency,
        price: Number(editingPlan.price),
        durationDays: editingPlan.durationDays,
        features: editingPlan.features,
        isActive: editingPlan.isActive,
      });
    }
  }, [editingPlan, reset]);

  const onSubmit = async (data: SubscriptionPlanFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (editingPlan) {
        await SubscriptionPlanApi.update(editingPlan.id, data);
      } else {
        await SubscriptionPlanApi.create(data);
      }
      reset();
      onSuccess();
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    onCancel();
    setSubmitError(null);
  };

  const currencySymbol = selectedCurrency === 'INR' ? '₹' : '$';
  const currencyPlaceholder = selectedCurrency === 'INR' ? 'e.g., 999' : 'e.g., 9.99';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {editingPlan ? 'Update Subscription Plan' : 'Create Subscription Plan'}
        </h2>
        {editingPlan && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Plan Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan Name <span className="text-red-500">*</span>
          </label>
          <select
            {...register('name')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Basic / Entry-Level Plans">Basic / Entry-Level Plans</option>
            <option value="Standard / Popular Plans">Standard / Popular Plans</option>
            <option value="Premium / Advanced Plans">Premium / Advanced Plans</option>
            <option value="Duration-Based (Common in India)">Duration-Based (Common in India)</option>
          </select>
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Enter plan description..."
                error={errors.description?.message}
              />
            )}
          />
        </div>

        {/* Price Currency & Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  {...register('priceCurrency')}
                  value="INR"
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">INR (₹)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  {...register('priceCurrency')}
                  value="USD"
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">USD ($)</span>
              </label>
            </div>
            {errors.priceCurrency && (
              <p className="mt-1 text-sm text-red-600">{errors.priceCurrency.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ({currencySymbol}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              placeholder={currencyPlaceholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (Days) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register('durationDays', { valueAsNumber: true })}
            placeholder="e.g., 30, 90, 180, 365"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.durationDays && (
            <p className="mt-1 text-sm text-red-600">{errors.durationDays.message}</p>
          )}
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Features <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Use bullet points for better formatting
          </p>
          <Controller
            name="features"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="<ul><li>Feature 1</li><li>Feature 2</li></ul>"
                error={errors.features?.message}
              />
            )}
          />
        </div>

        {/* Is Active */}
        <div className="flex items-center gap-3">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <ToggleSwitch checked={field.value} onChange={field.onChange} />
            )}
          />
          <label className="text-sm font-medium text-gray-700">Active Status</label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {editingPlan ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================================================
// SUBSCRIPTION PLANS TABLE
// ============================================================================

interface SubscriptionPlansTableProps {
  onEdit: (plan: SubscriptionPlan) => void;
}

const SubscriptionPlansTable: React.FC<SubscriptionPlansTableProps> = ({ onEdit }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const pageSize = 10;

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const result = await SubscriptionPlanApi.list({
        page,
        limit: pageSize,
        search,
        sortBy,
        sortOrder,
      });
      setPlans(result.plans || result);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      await SubscriptionPlanApi.toggleActive(plan.id);
      fetchPlans();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-800">Subscription Plans</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by plan name or duration..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-80 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Plan Name
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Price
                  <SortIcon field="price" />
                </div>
              </th>
              <th
                onClick={() => handleSort('durationDays')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Duration
                  <SortIcon field="durationDays" />
                </div>
              </th>
              <th
                onClick={() => handleSort('isActive')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon field="isActive" />
                </div>
              </th>
              <th
                onClick={() => handleSort('createdAt')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Created
                  <SortIcon field="createdAt" />
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <LoadingSpinner />
                </td>
              </tr>
            ) : plans.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState message="No subscription plans found" />
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                    {plan._count && plan._count.gyms > 0 && (
                      <div className="text-xs text-gray-500">{plan._count.gyms} gyms</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {plan.priceCurrency === 'INR' ? '₹' : '$'}
                      {Number(plan.price).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{plan.durationDays} days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge active={plan.isActive} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(plan.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(plan)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(plan)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          plan.isActive
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {plan.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table - Mobile (Card Layout) */}
      <div className="md:hidden">
        {loading ? (
          <LoadingSpinner />
        ) : plans.length === 0 ? (
          <EmptyState message="No subscription plans found" />
        ) : (
          <div className="divide-y divide-gray-200">
            {plans.map((plan) => (
              <div key={plan.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{plan.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(plan.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge active={plan.isActive} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <span className="ml-1 font-medium">
                      {plan.priceCurrency === 'INR' ? '₹' : '$'}
                      {Number(plan.price).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-1 font-medium">{plan.durationDays} days</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(plan)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                      plan.isActive
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {plan.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && plans.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function SubscriptionPlansPage() {
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setEditingPlan(null);
    setRefreshKey((k) => k + 1);
  };

  const handleCancel = () => {
    setEditingPlan(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage gym subscription plans with flexible pricing and features
          </p>
        </div>

        {/* Form */}
        <SubscriptionPlanForm
          editingPlan={editingPlan}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />

        {/* Table */}
        <SubscriptionPlansTable key={refreshKey} onEdit={setEditingPlan} />
      </div>
    </div>
  );
}
