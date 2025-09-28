import React, { useEffect, useState } from 'react';
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiSave,
  FiX,
  FiAlertCircle,
  FiNavigation,
  FiMap,
} from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import Input from '../../components/atoms/Input/Input';
import { BranchService } from '../../services/branchService';
import {
  useAreaSetRecoilState,
  useAreaValue,
  useBranchValue,
  useZoneSetRecoilState,
  useZoneValue,
} from '../../store/authAtoms';
import { useDebounce } from 'use-debounce';

// Define types based on your interfaces
export interface IZone {
  id?: string;
  organizationId?: string;
  name: string;
}

export interface IArea {
  id?: string;
  organizationId?: string;
  name: string;
  branchId: string;
  zoneId: string;
  deliveryTime: Date;
  deliveryCharge: number;
}

const AreasZonesPage: React.FC = () => {
  // Zones state
  const zones = useZoneValue();
  const setZones = useZoneSetRecoilState();
  const branches = useBranchValue();
  const [zoneSearch, setZoneSearch] = useState('');
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<IZone | null>(null);
  const [newZone, setNewZone] = useState<Partial<IZone>>({ name: '' });
  const [zoneValidationErrors, setZoneValidationErrors] = useState<{ name?: string }>({});

  // Areas state
  const areas = useAreaValue();
  const setAreas = useAreaSetRecoilState();

  // const [areas, setAreas] = useState<IArea[]>(mockAreas);
  const [areaSearch, setAreaSearch] = useState('');
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [editingArea, setEditingArea] = useState<IArea | null>(null);
  const [newArea, setNewArea] = useState<Partial<IArea>>({
    name: '',
    deliveryTime: new Date(30 * 60 * 1000),
    deliveryCharge: 0,
  });
  type AreaValidationFields = 'name' | 'branchId' | 'zoneId' | 'deliveryCharge';
  const [areaValidationErrors, setAreaValidationErrors] = useState<Partial<Record<AreaValidationFields, string>>>({});
  const {
    createZone,
    updateZone,
    deleteZone,
    searchZones,
    searchBranch,
    createArea,
    updateArea,
    deleteArea,
    searchAreas,
  } = new BranchService();
  // Search states for dropdowns
  const [branchSearch, setBranchSearch] = useState('');
  const [zoneDropdownSearch, setZoneDropdownSearch] = useState('');
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);

  // Pagination
  const [currentZonePage, setCurrentZonePage] = useState(1);
  const [currentAreaPage, setCurrentAreaPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Filter zones and areas based on search
  const filteredZones = zones.filter((zone) => zone.name.toLowerCase().includes(zoneSearch.toLowerCase()));
  const [filteredBranches, setFilteredBranches] = useState<any[]>([]);
  const [filteredZoneDropdown, setFilteredZoneDropdown] = useState<any[]>([]);
  const filteredAreas = areas.filter((area) => area.name.toLowerCase().includes(areaSearch.toLowerCase()));

  // Pagination calculations
  const totalZonePages = Math.ceil(filteredZones.length / itemsPerPage);
  const totalAreaPages = Math.ceil(filteredAreas.length / itemsPerPage);

  const currentZones = filteredZones.slice((currentZonePage - 1) * itemsPerPage, currentZonePage * itemsPerPage);

  const currentAreas = filteredAreas.slice((currentAreaPage - 1) * itemsPerPage, currentAreaPage * itemsPerPage);

  const formatTime = (input: string | Date) => {
    if (!input) return '';

    const date = input instanceof Date ? input : new Date(input);

    if (isNaN(date.getTime())) {
      return ''; // invalid date string
    }

    const totalMinutes = Math.floor(date.getTime() / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes} min`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  // Zone CRUD Operations
  const validateZone = (): boolean => {
    const errors: { name?: string } = {};

    if (!newZone.name || newZone.name.trim().length === 0) {
      errors.name = 'Zone name is required';
    } else if (newZone.name.length < 2) {
      errors.name = 'Zone name must be at least 2 characters';
    }

    setZoneValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateZone = async () => {
    try {
      if (!validateZone()) return;

      const zoneToCreate: IZone = {
        name: newZone.name!,
      };

      const { data } = await createZone(zoneToCreate);

      setZones([...zones, data]);
      setShowZoneModal(false);
      resetZoneForm();
    } catch (error: any) {
      alert('something went wrong');
      console.error(error.message);
    }
  };

  const handleUpdateZone = async () => {
    try {
      if (!editingZone || !validateZone()) return;
      const { data } = await updateZone({ zoneId: newZone.id, name: newZone.name });
      setZones(zones.map((zone) => (zone.id === editingZone.id ? { ...(data as IZone) } : zone)));
      setShowZoneModal(false);
      setEditingZone(null);
      resetZoneForm();
    } catch (error: any) {
      alert('something went wrong');
      console.error(error.message);
    }
  };

  const handleEditZone = (zone: IZone) => {
    setEditingZone(zone);
    setNewZone(zone);
    setZoneValidationErrors({});
    setShowZoneModal(true);
  };

  const handleDeleteZone = async (zoneId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this zone? This will affect associated areas.')) {
        await deleteZone(zoneId);
        setZones(zones.filter((zone) => zone.id !== zoneId));
        // Also remove areas associated with this zone
        setAreas(areas.filter((area) => area.zoneId !== zoneId));
      }
    } catch (error: any) {
      alert('something went wrong');
      console.error(error.message);
    }
  };

  const resetZoneForm = () => {
    setNewZone({ name: '' });
    setEditingZone(null);
    setZoneValidationErrors({});
  };

  // Area CRUD Operations
  const validateArea = (): boolean => {
    const errors: {
      name?: string;
      branchId?: string;
      zoneId?: string;
      deliveryCharge?: string;
    } = {};

    if (!newArea.name || newArea.name.trim().length === 0) {
      errors.name = 'Area name is required';
    } else if (newArea.name.length < 2) {
      errors.name = 'Area name must be at least 2 characters';
    }

    if (!newArea.branchId) {
      errors.branchId = 'Branch is required';
    }

    if (!newArea.zoneId) {
      errors.zoneId = 'Zone is required';
    }

    if (newArea.deliveryCharge === undefined || newArea.deliveryCharge < 0) {
      errors.deliveryCharge = 'Delivery charge must be a positive number';
    }

    setAreaValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateArea = async () => {
    try {
      if (!validateArea()) return;

      const areaToCreate: IArea = {
        name: newArea.name!,
        branchId: newArea.branchId!,
        zoneId: newArea.zoneId!,
        deliveryTime: newArea.deliveryTime || new Date(30 * 60 * 1000),
        deliveryCharge: newArea.deliveryCharge || 0,
      };
      const { data } = await createArea(areaToCreate);
      setAreas([...areas, data]);
      setShowAreaModal(false);
      resetAreaForm();
    } catch (error: any) {
      alert('something went wrong');
      console.error(error.message);
    }
  };

  const handleUpdateArea = async () => {
    try {
      if (!editingArea || !validateArea()) return;
      const { data } = await updateArea(newArea as IArea);
      setAreas(areas.map((area) => (area.id === editingArea.id ? { ...data } : area)));
      setShowAreaModal(false);
      setEditingArea(null);
      resetAreaForm();
    } catch (error: any) {
      alert('something went wrong');
      console.error(error.message);
    }
  };

  const handleEditArea = (area: IArea) => {
    setEditingArea(area);
    setNewArea(area);
    setAreaValidationErrors({});
    setShowAreaModal(true);
  };

  const handleDeleteArea = async (areaId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this area?')) {
        await deleteArea(areaId);
        setAreas(areas.filter((area) => area.id !== areaId));
      }
    } catch (error: any) {
      alert('something went wrong');
      console.error(error.message);
    }
  };

  const resetAreaForm = () => {
    setNewArea({
      name: '',
      deliveryTime: new Date(30 * 60 * 1000),
      deliveryCharge: 0,
    });
    setEditingArea(null);
    setAreaValidationErrors({});
    setBranchSearch('');
    setZoneDropdownSearch('');
    setShowBranchDropdown(false);
    setShowZoneDropdown(false);
  };

  const handleAreaFieldChange = (field: keyof IArea, value: any) => {
    setNewArea((prev) => ({ ...prev, [field]: value }));

    if (field in areaValidationErrors) {
      setAreaValidationErrors((prev) => ({
        ...prev,
        [field as AreaValidationFields]: undefined,
      }));
    }
  };

  useEffect(() => {
    setFilteredZoneDropdown(zones);
    setFilteredBranches(branches);
  }, [branches, zones]);

  const [branchDebouncedTerm] = useDebounce(branchSearch, 500); // 500ms delay
  useEffect(() => {
    const fetchBranches = async () => {
      if (!branchDebouncedTerm) {
        setFilteredBranches([]); // clear results when search is empty
        return;
      }
      const { data } = await searchBranch(branchSearch);
      setFilteredBranches(data.data); // now filteredProducts is an array
    };

    fetchBranches();
  }, [branchDebouncedTerm]);

  const [zoneDebouncedTerm] = useDebounce(zoneSearch || zoneDropdownSearch, 500); // 500ms delay
  useEffect(() => {
    const fn = async () => {
      if (!zoneDebouncedTerm) {
        // maybe clear results
        return;
      }
      const { data } = await searchZones(zoneSearch || zoneDropdownSearch);
      if (zoneSearch) setZones(data.data);
      else if (zoneDropdownSearch) setFilteredZoneDropdown(data.data);
      else return;
    };
    fn();
  }, [zoneDebouncedTerm]);

  const [areaDebouncedTerm] = useDebounce(areaSearch, 500); // 500ms delay
  useEffect(() => {
    const fn = async () => {
      if (!areaDebouncedTerm) {
        return;
      }
      const { data } = await searchAreas(areaSearch);
      setAreas(data.data);
    };
    fn();
  }, [areaDebouncedTerm]);

  return (
    <div className="space-y-8 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Areas & Zones Management</h2>
          <p className="text-neutral-600 mt-1">Manage delivery areas and zones for your branches</p>
        </div>
      </div>

      {/* Zones Section */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
              <FiMap className="mr-2 text-primary-600" />
              Zones
            </h3>
            <Button onClick={() => setShowZoneModal(true)} size="sm">
              <FiPlus className="mr-2" />
              Add Zone
            </Button>
          </div>
        </div>

        {/* Zone Search */}
        <div className="p-4 border-b border-neutral-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search zones by name..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={zoneSearch}
              onChange={(e) => setZoneSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Zones List */}
        <div className="divide-y divide-neutral-200">
          {currentZones.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <FiMap className="mx-auto text-4xl text-neutral-300 mb-3" />
              <p>No zones found{zoneSearch && ` matching "${zoneSearch}"`}</p>
            </div>
          ) : (
            currentZones.map((zone) => (
              <div
                key={zone.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 hover:bg-neutral-50"
              >
                <div className="md:col-span-8 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiNavigation className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">{zone.name}</h4>
                    <p className="text-sm text-neutral-500">
                      {areas.filter((area) => area.zoneId === zone.id).length} areas
                    </p>
                  </div>
                </div>
                <div className="md:col-span-4 flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditZone(zone)}>
                    <FiEdit className="mr-1" />
                    <span className="hidden md:inline">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteZone(zone.id!)}
                    className="text-error hover:bg-error-50"
                  >
                    <FiTrash2 className="mr-1" />
                    <span className="hidden md:inline">Delete</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Zone Pagination */}
        {totalZonePages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-neutral-200 space-y-3 sm:space-y-0">
            <div className="text-sm text-neutral-500">
              Showing {(currentZonePage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentZonePage * itemsPerPage, filteredZones.length)} of {filteredZones.length} zones
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentZonePage === 1}
                onClick={() => setCurrentZonePage(currentZonePage - 1)}
              >
                <FiChevronLeft className="mr-1" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalZonePages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalZonePages > 5) {
                    if (currentZonePage <= 3) pageNum = i + 1;
                    else if (currentZonePage >= totalZonePages - 2) pageNum = totalZonePages - 4 + i;
                    else pageNum = currentZonePage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`px-3 py-1 rounded text-sm ${
                        pageNum === currentZonePage
                          ? 'bg-primary-600 text-white'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                      onClick={() => setCurrentZonePage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentZonePage === totalZonePages}
                onClick={() => setCurrentZonePage(currentZonePage + 1)}
              >
                Next
                <FiChevronRight className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Areas Section */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
              <FiMapPin className="mr-2 text-primary-600" />
              Areas
            </h3>
            <Button onClick={() => setShowAreaModal(true)} size="sm">
              <FiPlus className="mr-2" />
              Add Area
            </Button>
          </div>
        </div>

        {/* Area Search */}
        <div className="p-4 border-b border-neutral-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search areas by name"
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={areaSearch}
              onChange={(e) => setAreaSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Areas List */}
        <div className="divide-y divide-neutral-200">
          {currentAreas.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <FiMapPin className="mx-auto text-4xl text-neutral-300 mb-3" />
              <p>No areas found{areaSearch && ` matching "${areaSearch}"`}</p>
            </div>
          ) : (
            currentAreas.map((area) => (
              <div
                key={area.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 hover:bg-neutral-50"
              >
                <div className="md:col-span-8 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiMapPin className="text-green-600 text-lg" />
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">{area.name}</h4>
                    <div className="text-sm text-neutral-500 space-y-1">
                      {/* <p>Branch: {getBranchName(area.branchId)}</p>
                      <p>Zone: {getZoneName(area.zoneId)}</p> */}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 hidden md:block text-right">
                  <p className="font-medium text-neutral-900">{formatTime(area.deliveryTime)}</p>
                  <p className="text-sm text-neutral-500">${area.deliveryCharge.toFixed(2)} charge</p>
                </div>
                <div className="md:col-span-2 flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditArea(area)}>
                    <FiEdit className="mr-1" />
                    <span className="hidden md:inline">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteArea(area.id!)}
                    className="text-error hover:bg-error-50"
                  >
                    <FiTrash2 className="mr-1" />
                    <span className="hidden md:inline">Delete</span>
                  </Button>
                </div>
                {/* Mobile details */}
                <div className="md:hidden col-span-1 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Delivery:</span>
                    <span className="font-medium">{formatTime(area.deliveryTime)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Charge:</span>
                    <span className="font-medium">${area.deliveryCharge.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Area Pagination */}
        {totalAreaPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-neutral-200 space-y-3 sm:space-y-0">
            <div className="text-sm text-neutral-500">
              Showing {(currentAreaPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentAreaPage * itemsPerPage, filteredAreas.length)} of {filteredAreas.length} areas
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentAreaPage === 1}
                onClick={() => setCurrentAreaPage(currentAreaPage - 1)}
              >
                <FiChevronLeft className="mr-1" />
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalAreaPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalAreaPages > 5) {
                    if (currentAreaPage <= 3) pageNum = i + 1;
                    else if (currentAreaPage >= totalAreaPages - 2) pageNum = totalAreaPages - 4 + i;
                    else pageNum = currentAreaPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`px-3 py-1 rounded text-sm ${
                        pageNum === currentAreaPage
                          ? 'bg-primary-600 text-white'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                      onClick={() => setCurrentAreaPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentAreaPage === totalAreaPages}
                onClick={() => setCurrentAreaPage(currentAreaPage + 1)}
              >
                Next
                <FiChevronRight className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Zone Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900">{editingZone ? 'Edit Zone' : 'Add New Zone'}</h3>
              <button
                onClick={() => {
                  setShowZoneModal(false);
                  resetZoneForm();
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="Zone Name *"
                value={newZone.name || ''}
                onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                error={zoneValidationErrors.name}
                required
              />
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowZoneModal(false);
                    resetZoneForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingZone ? handleUpdateZone : handleCreateZone}>
                  <FiSave className="mr-2" />
                  {editingZone ? 'Update Zone' : 'Create Zone'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Area Modal */}
      {showAreaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900">{editingArea ? 'Edit Area' : 'Add New Area'}</h3>
              <button
                onClick={() => {
                  setShowAreaModal(false);
                  resetAreaForm();
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Validation Summary */}
              {Object.values(areaValidationErrors).some((error) => error) && (
                <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FiAlertCircle className="text-error-600 mr-3 text-xl" />
                    <div>
                      <h4 className="text-error-800 font-medium">Please fix the following errors:</h4>
                      <ul className="text-error-700 text-sm mt-1 list-disc list-inside">
                        {Object.entries(areaValidationErrors).map(([field, error]) =>
                          error ? <li key={field}>{error}</li> : null
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <Input
                label="Area Name *"
                value={newArea.name || ''}
                onChange={(e) => handleAreaFieldChange('name', e.target.value)}
                error={areaValidationErrors.name}
                required
              />

              {/* Branch Selection */}
              <div className="relative">
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Branch *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for a branch..."
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={branchSearch}
                    onChange={(e) => {
                      setBranchSearch(e.target.value);
                      setShowBranchDropdown(true);
                    }}
                    onFocus={() => setShowBranchDropdown(true)}
                  />
                  {showBranchDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredBranches.map((branch) => (
                        <div
                          key={branch.id}
                          className="px-4 py-3 hover:bg-neutral-100 cursor-pointer border-b border-neutral-200 last:border-b-0"
                          onClick={() => {
                            handleAreaFieldChange('branchId', branch.id);
                            setBranchSearch(branch.name);
                            setShowBranchDropdown(false);
                          }}
                        >
                          <div className="font-medium">{branch.name}</div>
                          <div className="text-sm text-neutral-500">{branch.code}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {areaValidationErrors.branchId && (
                  <span className="text-error text-sm mt-1">{areaValidationErrors.branchId}</span>
                )}
              </div>

              {/* Zone Selection */}
              <div className="relative">
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Zone *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for a zone..."
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={zoneDropdownSearch}
                    onChange={(e) => {
                      setZoneDropdownSearch(e.target.value);
                      setShowZoneDropdown(true);
                    }}
                    onFocus={() => setShowZoneDropdown(true)}
                  />
                  {showZoneDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredZoneDropdown.map((zone) => (
                        <div
                          key={zone.id}
                          className="px-4 py-3 hover:bg-neutral-100 cursor-pointer border-b border-neutral-200 last:border-b-0"
                          onClick={() => {
                            handleAreaFieldChange('zoneId', zone.id);
                            setZoneDropdownSearch(zone.name);
                            setShowZoneDropdown(false);
                          }}
                        >
                          <div className="font-medium">{zone.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {areaValidationErrors.zoneId && (
                  <span className="text-error text-sm mt-1">{areaValidationErrors.zoneId}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Delivery Time (minutes)"
                  type="number"
                  value={
                    newArea.deliveryTime
                      ? Math.floor(
                          (newArea.deliveryTime instanceof Date
                            ? newArea.deliveryTime
                            : new Date(newArea.deliveryTime)
                          ).getTime() /
                            (1000 * 60)
                        )
                      : 30
                  }
                  onChange={(e) =>
                    handleAreaFieldChange('deliveryTime', new Date(parseInt(e.target.value) * 60 * 1000))
                  }
                  min="1"
                  max="480"
                />
                <Input
                  label="Delivery Charge ($) *"
                  type="number"
                  step="0.01"
                  value={newArea.deliveryCharge || 0}
                  onChange={(e) => handleAreaFieldChange('deliveryCharge', parseFloat(e.target.value) || 0)}
                  error={areaValidationErrors.deliveryCharge}
                  min="0"
                  max="100"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAreaModal(false);
                    resetAreaForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingArea ? handleUpdateArea : handleCreateArea}>
                  <FiSave className="mr-2" />
                  {editingArea ? 'Update Area' : 'Create Area'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreasZonesPage;
