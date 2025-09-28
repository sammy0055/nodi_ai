import React, { useEffect, useState, useMemo } from 'react';
import {
  FiCreditCard,
  FiCheck,
  FiZap,
  FiArrowDown,
  FiInfo,
  FiCheckCircle,
  FiClock,
  FiShoppingCart,
  FiMessageSquare,
  FiBarChart2,
  FiX,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import type {
  CreditBalanceAttributes,
  ISubscription,
  ISubscriptionPlan,
  UsageRecordAttributes,
} from '../../types/subscription';
import {
  useCreditBalanceValue,
  useCreditUsageValue,
  useSubscriptionPlanValue,
  useSubscriptionValue,
} from '../../store/authAtoms';
import { SubscriptionService } from '../../services/subscriptionService';

// Chart data interface
interface ChartData {
  date: string;
  credits: number;
  type: 'API Calls' | 'Data Export' | 'Report Generation' | 'Data Import';
}

const generateChartData = (records: UsageRecordAttributes[]): ChartData[] => {
  const dailyData: { [key: string]: { credits: number; types: { [key: string]: number } } } = {};

  records.forEach((record) => {
    const date = new Date(record.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    if (!dailyData[date]) {
      dailyData[date] = { credits: 0, types: {} };
    }

    dailyData[date].credits += record.creditsConsumed;
    dailyData[date].types[record.featureName] =
      (dailyData[date].types[record.featureName] || 0) + record.creditsConsumed;
  });

  return Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      credits: data.credits,
      type: Object.entries(data.types).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as ChartData['type'],
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Simple bar chart component
const BarChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
  const maxCredits = Math.max(...data.map((d) => d.credits), 100);

  return (
    <div className="w-full h-64 md:h-80 bg-neutral-50 rounded-lg p-4">
      <div className="flex items-end justify-between h-full space-x-2 md:space-x-4">
        {data.map((item, index) => {
          const height = (item.credits / maxCredits) * 100;
          const getColor = (type: string) => {
            switch (type) {
              case 'API Calls':
                return 'bg-primary-500';
              case 'Data Export':
                return 'bg-green-500';
              case 'Report Generation':
                return 'bg-yellow-500';
              case 'Data Import':
                return 'bg-purple-500';
              default:
                return 'bg-neutral-500';
            }
          };

          return (
            <div key={index} className="flex flex-col items-center flex-1 h-full">
              <div className="flex flex-col justify-end h-full w-full">
                <div
                  className={`${getColor(item.type)} rounded-t transition-all duration-500 ease-out hover:opacity-80`}
                  style={{ height: `${height}%` }}
                  title={`${item.credits} credits on ${item.date}`}
                ></div>
              </div>
              <div className="text-xs text-neutral-500 mt-2 text-center">{item.date.split(' ')[1]}</div>
              <div className="text-xs font-medium mt-1 text-center">{item.credits}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Line chart component for trend visualization
const LineChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
  const maxCredits = Math.max(...data.map((d) => d.credits), 100);
  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item.credits / maxCredits) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-full h-64 md:h-80 bg-neutral-50 rounded-lg p-4 relative">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e5e5e5" strokeWidth="0.5" />
        ))}

        {/* Trend line */}
        <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points} />

        {/* Data points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - (item.credits / maxCredits) * 100;
          return <circle key={index} cx={x} cy={y} r="1.5" fill="#3b82f6" className="hover:r-2 transition-all" />;
        })}
      </svg>

      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-neutral-500 py-4">
        <span>{maxCredits}</span>
        <span>{Math.round(maxCredits * 0.75)}</span>
        <span>{Math.round(maxCredits * 0.5)}</span>
        <span>{Math.round(maxCredits * 0.25)}</span>
        <span>0</span>
      </div>
    </div>
  );
};

const BillingPage: React.FC = () => {
  const plans = useSubscriptionPlanValue();
  const currentSubscription = useSubscriptionValue();
  const creditBalance = useCreditBalanceValue();
  const usageRecords = useCreditUsageValue();

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ISubscriptionPlan | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecords, setFilteredRecords] = useState<UsageRecordAttributes[]>(usageRecords);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [btnLoading, setBtnLoading] = useState(false);
  const { createSubscription, upgradeSubscription } = new SubscriptionService();
  const currentPlan = plans.find((plan) => plan.id === currentSubscription?.planId);

  // Generate chart data
  const chartData = useMemo(() => generateChartData(usageRecords), [usageRecords]);

  // Filter usage records based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRecords(usageRecords);
    } else {
      const filtered = usageRecords.filter(
        (record) =>
          record.featureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.metadata?.endpoint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.metadata?.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecords(filtered);
    }
  }, [searchTerm, usageRecords]);

  const handleSubscribe = (plan: ISubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsUpgrading(currentSubscription?.planId !== plan.id);
    setShowPlanModal(true);
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlan) return;

    // Simulate API call
    try {
      if (currentPlan?.id) {
        setBtnLoading(true);
        await upgradeSubscription({ planId: selectedPlan.id });
        setBtnLoading(false);
        setShowPlanModal(false);
        setSelectedPlan(null);
        window.location.reload();
        return;
      }
      const { data } = await createSubscription({ planId: selectedPlan.id });
      window.location.href = data.url;

      setShowPlanModal(false);
      setSelectedPlan(null);
    } catch (error: any) {
      alert('Error processing subscription. Please try again.');
      console.error(error.message);
      setShowPlanModal(false);
    }
  };

  const getStatusColor = (status: 'active' | 'past_due' | 'trialing' | 'expired') => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const formatDate = (date: Date | string) => {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(parsedDate);
  };

  const getCreditUsagePercentage = () => {
    return (creditBalance?.usedCredits! / creditBalance?.totalCredits!) * 100;
  };

  // Usage Record Item Component
  const UsageRecordItem: React.FC<{ record: UsageRecordAttributes }> = ({ record }) => (
    <div className="flex space-x-3 p-4 border-b border-neutral-200 last:border-b-0 hover:bg-neutral-50">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <FiZap className="text-primary-600" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-neutral-900 truncate">{record.featureName}</h4>
          <span className="text-sm font-semibold text-error-600">-{record.creditsConsumed} credits</span>
        </div>
        <p className="text-sm text-neutral-600 mb-2">
          {record.metadata?.endpoint && `Endpoint: ${record.metadata.endpoint}`}
          {record.metadata?.type && `Type: ${record.metadata.type}`}
          {record.metadata?.format && `Format: ${record.metadata.format}`}
        </p>
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>{formatDate(record.createdAt)}</span>
          {record.metadata?.count && <span>{record.metadata.count} operations</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Billing & Subscription</h2>
          <p className="text-neutral-600 mt-1">Manage your subscription and credit usage</p>
        </div>
      </div>

      {/* Current Subscription and Credit Balance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Subscription Card */}
        <div className="bg-white rounded-lg shadow-medium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Current Plan</h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                currentSubscription?.status!
              )}`}
            >
              {currentSubscription?.status &&
                currentSubscription?.status?.charAt(0).toUpperCase() + currentSubscription?.status?.slice(1)}
            </span>
          </div>

          {currentPlan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-neutral-900">{currentPlan.name}</h4>
                  <p className="text-neutral-600">{currentPlan.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">${currentPlan.price}/mo</p>
                  <p className="text-sm text-neutral-500">{currentPlan.creditPoints.toLocaleString()} credits</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500">Current Period</p>
                  <p className="font-medium">
                    {formatDate(currentSubscription?.currentPeriodStart!)} -{' '}
                    {formatDate(currentSubscription?.currentPeriodEnd!)}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Next Billing</p>
                  <p className="font-medium">{formatDate(currentSubscription?.nextBillingDate!)}</p>
                </div>
              </div>

              <Button variant="primary" onClick={() => setShowPlanModal(true)} className="w-full">
                <FiCreditCard className="mr-2" />
                Change Plan
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <FiShoppingCart className="mx-auto text-4xl text-neutral-300 mb-3" />
              <p className="text-neutral-500">No active subscription</p>
              <Button variant="primary" onClick={() => setShowPlanModal(true)} className="mt-3">
                Subscribe to a Plan
              </Button>
            </div>
          )}
        </div>

        {/* Credit Balance Card */}
        <div className="bg-white rounded-lg shadow-medium p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Credit Balance</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Remaining Credits</span>
              <span className="text-2xl font-bold text-primary-600">
                {creditBalance?.remainingCredits.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used: {creditBalance?.usedCredits.toLocaleString()}</span>
                <span>Total: {creditBalance?.totalCredits.toLocaleString()}</span>
              </div>

              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getCreditUsagePercentage()}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <FiArrowDown className="mx-auto text-green-600 mb-1" />
                <p className="text-sm font-medium text-green-600">Available</p>
                <p className="text-lg font-bold">{creditBalance?.remainingCredits.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <FiZap className="mx-auto text-yellow-600 mb-1" />
                <p className="text-sm font-medium text-yellow-600">Used</p>
                <p className="text-lg font-bold">{creditBalance?.usedCredits.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FiCheckCircle className="mx-auto text-blue-600 mb-1" />
                <p className="text-sm font-medium text-blue-600">Total</p>
                <p className="text-lg font-bold">{creditBalance?.totalCredits.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Usage Trends Section */}
      <div className="bg-white rounded-lg shadow-medium">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div className="flex items-center space-x-2">
              <FiBarChart2 className="text-primary-600" />
              <h3 className="text-lg font-semibold text-neutral-900">Credit Usage Trends</h3>
            </div>

            <div className="flex space-x-2">
              <div className="flex bg-neutral-100 rounded-lg p-1">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    chartType === 'bar'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    chartType === 'line'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Line
                </button>
              </div>

              <div className="flex bg-neutral-100 rounded-lg p-1">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    timeRange === '7d'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    timeRange === '30d'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  30D
                </button>
                <button
                  onClick={() => setTimeRange('90d')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    timeRange === '90d'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  90D
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {chartData.length > 0 ? (
            chartType === 'bar' ? (
              <BarChart data={chartData} />
            ) : (
              <LineChart data={chartData} />
            )
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <FiBarChart2 className="mx-auto text-4xl text-neutral-300 mb-3" />
              <p>No usage data available for the selected period</p>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary-500 rounded"></div>
              <span className="text-sm text-neutral-600">API Calls</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-neutral-600">Data Export</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-sm text-neutral-600">Report Generation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-sm text-neutral-600">Data Import</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Usage Records Section */}
      <div className="bg-white rounded-lg shadow-medium">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <h3 className="text-lg font-semibold text-neutral-900">Recent Usage Records</h3>
            <div className="relative md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMessageSquare className="text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Search usage records..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-neutral-200 max-h-96 overflow-y-auto">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <FiClock className="mx-auto text-4xl text-neutral-300 mb-3" />
              <p>No usage records found{searchTerm && ` matching "${searchTerm}"`}</p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-2">
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            filteredRecords.map((record) => <UsageRecordItem key={record.id} record={record} />)
          )}
        </div>
      </div>

      {/* Subscription Plans Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900">
                {selectedPlan ? `${isUpgrading ? 'Upgrade to' : 'Subscribe to'} ${selectedPlan.name}` : 'Choose a Plan'}
              </h3>
              <button
                onClick={() => {
                  setShowPlanModal(false);
                  setSelectedPlan(null);
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              {!selectedPlan ? (
                // Plan Selection View
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`border-2 rounded-lg p-6 transition-all duration-300 hover:shadow-lg ${
                        currentSubscription?.planId === plan.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="text-center mb-4">
                        <h4 className="text-xl font-bold text-neutral-900 mb-2">{plan.name}</h4>
                        <p className="text-neutral-600 text-sm">{plan.description}</p>
                      </div>

                      <div className="text-center mb-6">
                        <span className="text-3xl font-bold text-primary-600">${plan.price}</span>
                        <span className="text-neutral-600">/month</span>
                        <p className="text-sm text-neutral-500 mt-1">{plan.creditPoints.toLocaleString()} credits</p>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features?.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <FiCheck className="text-green-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant={currentSubscription?.planId === plan.id ? 'outline' : 'primary'}
                        onClick={() => handleSubscribe(plan)}
                        className="w-full"
                        disabled={currentSubscription?.planId === plan.id}
                      >
                        {currentSubscription?.planId === plan.id
                          ? 'Current Plan'
                          : currentSubscription?.planId
                          ? 'Upgrade'
                          : 'Subscribe'}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                // Confirmation View
                <div className="max-w-2xl mx-auto">
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-3">
                      <FiInfo className="text-primary-600 mr-2" />
                      <h4 className="font-semibold text-primary-900">Plan Summary</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-600">Plan:</span>
                        <p className="font-medium">{selectedPlan.name}</p>
                      </div>
                      <div>
                        <span className="text-neutral-600">Price:</span>
                        <p className="font-medium">${selectedPlan.price}/month</p>
                      </div>
                      <div>
                        <span className="text-neutral-600">Credits:</span>
                        <p className="font-medium">{selectedPlan.creditPoints.toLocaleString()}/month</p>
                      </div>
                      <div>
                        <span className="text-neutral-600">Billing:</span>
                        <p className="font-medium">Monthly</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium text-neutral-900">Plan Features:</h5>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedPlan.features?.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <FiCheck className="text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-neutral-200">
                    <Button variant="outline" onClick={() => setSelectedPlan(null)}>
                      Back to Plans
                    </Button>
                    <Button onClick={handleConfirmSubscription} variant="primary" isLoading={btnLoading}>
                      <FiCreditCard className="mr-2" />
                      Confirm {isUpgrading ? 'Upgrade' : 'Subscription'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
