import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiPackage, FiZap, FiCheck, FiAlertCircle } from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import Input from '../../components/atoms/Input/Input';
import { useLoaderData } from 'react-router';
import type { CreateSubscriptionPlanAttributes, ISubscriptionPlan } from '../../types/subscription';
import { AdminSubscriptionPlanService } from '../../services/admin/AdminSubscriptionPlanService';

const SubscriptionPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<CreateSubscriptionPlanAttributes[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CreateSubscriptionPlanAttributes | null>(null);
  const [newPlan, setNewPlan] = useState<Partial<CreateSubscriptionPlanAttributes>>({
    name: '',
    description: '',
    price: 0,
    creditPoints: 0,
    features: [''],
    isActive: true,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const data = useLoaderData() as { data: ISubscriptionPlan };
  const { createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } = new AdminSubscriptionPlanService();
  useEffect(() => {
    if (!data.data) return;
    setPlans(data.data as any);
  }, [data]);
  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newPlan.name?.trim()) {
      errors.name = 'Plan name is required';
    }

    if (!newPlan.description?.trim()) {
      errors.description = 'Description is required';
    }

    if (newPlan.price === undefined || newPlan.price < 0) {
      errors.price = 'Price must be a positive number';
    }

    if (newPlan.creditPoints === undefined || newPlan.creditPoints < 0) {
      errors.creditPoints = 'Credit points must be a positive number';
    }

    if (!newPlan.features || newPlan.features.length === 0 || !newPlan.features.some((f) => f.trim())) {
      errors.features = 'At least one feature is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD Operations
  const handleCreatePlan = async () => {
    if (!validateForm()) return;

    const planToCreate: Omit<CreateSubscriptionPlanAttributes, 'id'> = {
      name: newPlan.name!,
      description: newPlan.description!,
      price: newPlan.price!,
      creditPoints: newPlan.creditPoints!,
      features: newPlan.features!.filter((f) => f.trim()),
      isActive: newPlan.isActive ?? true,
    };

    try {
      const plan = await createSubscriptionPlan(planToCreate);
      setPlans([...plans, plan.data]);
      setShowPlanModal(false);
      resetForm();
    } catch (error: any) {
      alert('something went wrong, please try again');
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan || !validateForm()) return;

    const updatedPlan: CreateSubscriptionPlanAttributes = {
      ...editingPlan,
      name: newPlan.name!,
      description: newPlan.description!,
      price: newPlan.price!,
      creditPoints: newPlan.creditPoints!,
      features: newPlan.features!.filter((f) => f.trim()),
      isActive: newPlan.isActive ?? true,
    };

    try {
      await updateSubscriptionPlan(updatedPlan);
      setPlans(plans.map((plan) => (plan.id === editingPlan.id ? updatedPlan : plan)));
      setShowPlanModal(false);
      setEditingPlan(null);
      resetForm();
    } catch (error: any) {
      alert('something went wrong, please try again');
    }
  };

  const handleEditPlan = (plan: CreateSubscriptionPlanAttributes) => {
    setEditingPlan(plan);
    setNewPlan({
      ...plan,
      features: [...plan.features, ''], // Add empty field for new feature
    });
    setValidationErrors({});
    setShowPlanModal(true);
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this subscription plan?')) {
        await deleteSubscriptionPlan(planId);
        setPlans(plans.filter((plan) => plan.id !== planId));
      }
    } catch (error: any) {
      alert('something went wrong, try again');
      console.error(error);
    }
  };

  // const handleToggleStatus = (planId: string) => {
  //   setPlans(plans.map((plan) => (plan.id === planId ? { ...plan, isActive: !plan.isActive } : plan)));
  // };

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...(newPlan.features || [])];
    updatedFeatures[index] = value;
    setNewPlan({ ...newPlan, features: updatedFeatures });
  };

  const addFeatureField = () => {
    setNewPlan({
      ...newPlan,
      features: [...(newPlan.features || []), ''],
    });
  };

  const removeFeatureField = (index: number) => {
    const updatedFeatures = newPlan.features?.filter((_, i) => i !== index) || [];
    setNewPlan({ ...newPlan, features: updatedFeatures });
  };

  const resetForm = () => {
    setNewPlan({
      name: '',
      description: '',
      price: 0,
      creditPoints: 0,
      features: [''],
      isActive: true,
    });
    setEditingPlan(null);
    setValidationErrors({});
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'Custom Pricing';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatCredits = (credits: number) => {
    if (credits === 0) return 'Custom Allocation';
    if (credits >= 1000) {
      return `${(credits / 1000).toFixed(0)}K credits`;
    }
    return `${credits} credits`;
  };

  // Plan Card Component
  const PlanCard: React.FC<{ plan: CreateSubscriptionPlanAttributes }> = ({ plan }) => (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-neutral-900">{plan.name}</h3>
            <p className="text-neutral-600 text-sm mt-1">{plan.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {plan.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-primary-600">{formatCurrency(plan.price)}</span>
            {plan.price > 0 && <span className="text-neutral-500">/month</span>}
          </div>
          <div className="flex items-center text-sm text-neutral-600 mt-1">
            <FiZap className="mr-1 text-yellow-500" />
            <span>{formatCredits(plan.creditPoints)}</span>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="font-medium text-neutral-900 mb-3">Features</h4>
          <ul className="space-y-2">
            {plan.features.slice(0, 4).map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-neutral-700">
                <FiCheck className="text-green-500 mr-2 flex-shrink-0" />
                <span className="line-clamp-1">{feature}</span>
              </li>
            ))}
            {plan.features.length > 4 && (
              <li className="text-sm text-neutral-500">+{plan.features.length - 4} more features</li>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan)} className="flex-1">
            <FiEdit className="mr-2" />
            Edit
          </Button>
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(plan.id)}
            className={`flex-1 ${
              plan.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'
            }`}
          >
            {plan.isActive ? 'Deactivate' : 'Activate'}
          </Button> */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeletePlan(plan.id)}
            className="text-red-600 hover:bg-red-50"
          >
            <FiTrash2 />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Subscription Plans</h2>
          <p className="text-neutral-600 mt-1">Manage your subscription plans and pricing</p>
        </div>

        <Button
          onClick={() => {
            setShowPlanModal(true);
            resetForm();
          }}
        >
          <FiPlus className="mr-2" />
          Add New Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="bg-white rounded-lg shadow-medium p-8 text-center">
          <FiPackage className="mx-auto text-4xl text-neutral-300 mb-3" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Subscription Plans</h3>
          <p className="text-neutral-600 mb-4">Get started by creating your first subscription plan</p>
          <Button
            onClick={() => {
              setShowPlanModal(true);
              resetForm();
            }}
          >
            <FiPlus className="mr-2" />
            Create First Plan
          </Button>
        </div>
      )}

      {/* Add/Edit Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900">
                {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
              </h3>
              <button
                onClick={() => {
                  setShowPlanModal(false);
                  resetForm();
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Validation Summary */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FiAlertCircle className="text-red-600 mr-3 text-xl" />
                    <div>
                      <h4 className="text-red-800 font-medium">Please fix the following errors:</h4>
                      <ul className="text-red-700 text-sm mt-1 list-disc list-inside">
                        {Object.entries(validationErrors).map(([field, error]) => (
                          <li key={field}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Plan Name */}
              <Input
                label="Plan Name *"
                type="text"
                value={newPlan.name || ''}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                error={validationErrors.name}
                placeholder="e.g., Professional, Enterprise"
              />

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Description *</label>
                <textarea
                  value={newPlan.description || ''}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  placeholder="Describe the plan and its target audience..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                    validationErrors.description ? 'border-red-300' : 'border-neutral-300'
                  }`}
                  rows={3}
                />
                {validationErrors.description && (
                  <span className="text-red-500 text-sm mt-1">{validationErrors.description}</span>
                )}
              </div>

              {/* Price and Credits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Monthly Price ($) *"
                  type="number"
                  value={newPlan.price || ""}
                  onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) || 0 })}
                  error={validationErrors.price}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />

                <Input
                  label="Credit Points *"
                  type="number"
                  value={newPlan.creditPoints || ""}
                  onChange={(e) => setNewPlan({ ...newPlan, creditPoints: parseInt(e.target.value) || 0 })}
                  error={validationErrors.creditPoints}
                  min="0"
                  placeholder="0"
                />
              </div>

              {/* Features */}
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Features *</label>
                <div className="space-y-2">
                  {newPlan.features?.map((feature, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder="Add a feature (e.g., 20M AI tokens)"
                        className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      {newPlan.features && newPlan.features.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeatureField(index)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <FiX />
                        </Button>
                      )}
                    </div>
                  ))}
                  {validationErrors.features && (
                    <span className="text-red-500 text-sm">{validationErrors.features}</span>
                  )}
                </div>
                <Button variant="outline" onClick={addFeatureField} className="mt-3">
                  <FiPlus className="mr-2" />
                  Add Feature
                </Button>
              </div>

              {/* Active Status */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newPlan.isActive ?? true}
                  onChange={(e) => setNewPlan({ ...newPlan, isActive: e.target.checked })}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-neutral-700">Active Plan</span>
              </label>

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPlanModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}>
                  <FiSave className="mr-2" />
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlansPage;
