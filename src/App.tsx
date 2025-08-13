import React, { useState, useMemo, useCallback, useEffect } from 'react';

// Helper components for UI elements
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
    {children}
  </h2>
);

const InputField = ({ label, type = 'text', value, onChange, placeholder, required = false, readOnly = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${readOnly ? 'bg-gray-100' : ''}`}
      required={required}
      readOnly={readOnly}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required = false }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
        <select
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            required={required}
        >
            <option value="" disabled>Select an option</option>
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);

const TextAreaField = ({ label, value, onChange, placeholder, rows = 3 }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            rows={rows}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        ></textarea>
    </div>
);


const Tab = ({ label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 whitespace-nowrap
      ${isActive
        ? 'bg-indigo-600 text-white'
        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
      }`}
  >
    {label}
  </button>
);

const MainInfo = React.memo(function MainInfo({ reportData, onMainInfoChange, onDateChange, onProductionLineChange, totalBagsRan, onAddDowntime, onRemoveDowntime, onDowntimeChange, onAddWorkOrder, onRemoveWorkOrder, onWorkOrderChange }) {
    const totalPallets = useMemo(() => {
        return reportData.productRuns.reduce((total, run) => total + (Number(run.totalPallets) || 0), 0);
    }, [reportData.productRuns]);
    
    return (
    <Card>
      <div className="flex justify-between items-start border-b pb-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-700">General Information</h2>
        <div className="text-right">
            <p className="text-sm font-medium text-gray-500">Total Bags Ran (Bagging Machine Count)</p>
            <p className="text-2xl font-bold text-indigo-600">{totalBagsRan.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="mt-4 p-4 border rounded-md bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Daily Summary</h3>
        {reportData.productRuns.map((run, index) => {
            const machineCount = Number(run.bags.machineCount) || 0;
            const finishedCount = Number(run.bags.finishedCount) || 0;
            const reworkAmount = Number(run.rework.amount) || 0;
            const netBagsProduced = finishedCount - reworkAmount;
            const wastedBags = machineCount - finishedCount;
            return (
                <div key={run.id} className={`py-2 ${index < reportData.productRuns.length - 1 ? 'border-b' : ''}`}>
                    <p className="font-semibold text-gray-700">{run.productName || `Product Run #${index + 1}`}</p>
                    <div className="flex justify-between text-sm text-gray-600 mt-1 flex-wrap">
                        <span>
                            Bags Produced: <span className="font-medium">{netBagsProduced.toLocaleString()}</span>
                            {reworkAmount > 0 && <span className="text-blue-600 font-medium ml-1">(+{reworkAmount.toLocaleString()} rework)</span>}
                        </span>
                        <span>Pallets: <span className="font-medium">{Number(run.totalPallets).toLocaleString()}</span></span>
                        <span>Wasted Bags: <span className="font-medium">{wastedBags.toLocaleString()}</span></span>
                    </div>
                </div>
            );
        })}
        <div className="mt-3 pt-3 border-t-2 border-gray-300 flex justify-between items-center">
            <p className="text-md font-bold text-gray-800">Total Pallets for the Day:</p>
            <p className="text-xl font-bold text-indigo-600">{totalPallets.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <InputField label="Production Date" type="date" value={reportData.date} onChange={onDateChange} required />
          <SelectField 
            label="Production Line" 
            value={reportData.productionLine} 
            onChange={onProductionLineChange} 
            options={['Line 1', 'Line 2']}
            required 
          />
        </div>
        <div>
            <InputField label="Shift Start Time" type="time" value={reportData.shift.startTime} onChange={(e) => onMainInfoChange('shift', 'startTime', e.target.value)} required />
            <InputField label="Shift Stop Time" type="time" value={reportData.shift.stopTime} onChange={(e) => onMainInfoChange('shift', 'stopTime', e.target.value)} required />
        </div>
      </div>

      <SectionTitle>Crew Details</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField label="Line Operator" value={reportData.crew.lineOperator} onChange={(e) => onMainInfoChange('crew', 'lineOperator', e.target.value)} />
        <InputField label="Forklift Operator" value={reportData.crew.forkliftOperator} onChange={(e) => onMainInfoChange('crew', 'forkliftOperator', e.target.value)} />
        <InputField label="Loader Operator" value={reportData.crew.loaderOperator} onChange={(e) => onMainInfoChange('crew', 'loaderOperator', e.target.value)} />
      </div>
      
      <SectionTitle>Downtime & Work Order</SectionTitle>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium text-gray-700">Downtime Details</h3>
                    <button
                        type="button"
                        onClick={onAddDowntime}
                        className="bg-blue-100 text-blue-700 font-semibold py-1 px-3 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm"
                    >
                        + Add Downtime
                    </button>
                </div>
                {reportData.downtimes.map((downtime, index) => (
                    <div key={downtime.id} className="p-4 border rounded-md mb-4 bg-gray-50 relative">
                         {reportData.downtimes.length > 1 && (
                            <button 
                                type="button" 
                                onClick={() => onRemoveDowntime(downtime.id)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                aria-label="Remove downtime"
                            >
                                &#x2715;
                            </button>
                         )}
                        <InputField label={`Time of Downtime #${index + 1}`} type="time" value={downtime.time} onChange={(e) => onDowntimeChange(downtime.id, 'time', e.target.value)} />
                        <InputField label="Product Associated with Downtime" value={downtime.productName} onChange={(e) => onDowntimeChange(downtime.id, 'productName', e.target.value)} />
                        <SelectField label="Duration" value={downtime.duration} onChange={(e) => onDowntimeChange(downtime.id, 'duration', e.target.value)} options={['0-5 mins', '5-15 mins', '15-30 mins', '30-60 mins', '1-2 hours', '2+ hours']} />
                        <TextAreaField label="Reason for Downtime" value={downtime.reason} onChange={(e) => onDowntimeChange(downtime.id, 'reason', e.target.value)} />
                        <TextAreaField label="Replacement Parts (if used)" value={downtime.parts} onChange={(e) => onDowntimeChange(downtime.id, 'parts', e.target.value)} />
                    </div>
                ))}
            </div>
            <div>
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium text-gray-700">Work Order</h3>
                    <button
                        type="button"
                        onClick={onAddWorkOrder}
                        className="bg-blue-100 text-blue-700 font-semibold py-1 px-3 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm"
                    >
                        + Add Work Order
                    </button>
                </div>
                {reportData.workOrders.map((wo, index) => (
                     <div key={wo.id} className="p-4 border rounded-md mb-4 bg-gray-50 relative">
                        {reportData.workOrders.length > 1 && (
                            <button 
                                type="button" 
                                onClick={() => onRemoveWorkOrder(wo.id)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                aria-label="Remove work order"
                            >
                                &#x2715;
                            </button>
                        )}
                        <InputField label={`Work Order #${index + 1}`} value={wo.number} onChange={(e) => onWorkOrderChange(wo.id, 'number', e.target.value)} />
                        <InputField label="Operator's Name" value={wo.operatorName} onChange={(e) => onWorkOrderChange(wo.id, 'operatorName', e.target.value)} />
                    </div>
                ))}
            </div>
       </div>
    </Card>
    );
});

const ProductRun = React.memo(function ProductRun({ index, data, onRemove, canRemove, onChange }) {
    const wastedBags = useMemo(() => {
        const machineCount = Number(data.bags.machineCount) || 0;
        const finishedCount = Number(data.bags.finishedCount) || 0;
        return machineCount - finishedCount;
    }, [data.bags.machineCount, data.bags.finishedCount]);

    const showRework = useMemo(() => {
        const machineCount = Number(data.bags.machineCount) || 0;
        const finishedCount = Number(data.bags.finishedCount) || 0;
        return finishedCount > machineCount && machineCount > 0;
    }, [data.bags.machineCount, data.bags.finishedCount]);

    useEffect(() => {
        const finishedCount = Number(data.bags.finishedCount) || 0;
        const bagsPerPallet = Number(data.bagsPerPallet) || 0;
        if (finishedCount > 0 && bagsPerPallet > 0) {
            const calculatedPallets = Math.floor(finishedCount / bagsPerPallet);
            if (calculatedPallets !== data.totalPallets) {
                onChange(data.id, null, 'totalPallets', calculatedPallets);
            }
        } else if (data.totalPallets !== 0) {
             onChange(data.id, null, 'totalPallets', 0);
        }
    }, [data.bags.finishedCount, data.bagsPerPallet, data.id, data.totalPallets, onChange]);


    return (
      <Card>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Product Run #{index + 1}</h2>
            {canRemove && (
                <button
                    type="button"
                    onClick={() => onRemove(data.id)}
                    className="text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md px-3 py-1 transition-colors"
                >
                    Remove Run
                </button>
            )}
        </div>

        <InputField label="Product Name" value={data.productName} onChange={(e) => onChange(data.id, null, 'productName', e.target.value)} required />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Run Timestamps</h3>
                <InputField label={`Start time for product ${index + 1}`} type="time" value={data.timestamps.startTime} onChange={(e) => onChange(data.id, 'timestamps', 'startTime', e.target.value)} />
                <InputField label={`End time for product ${index + 1}`} type="time" value={data.timestamps.endTime} onChange={(e) => onChange(data.id, 'timestamps', 'endTime', e.target.value)} />
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Bag & Pallet Counts</h3>
                <InputField label="Machine Count" type="number" value={data.bags.machineCount} onChange={(e) => onChange(data.id, 'bags', 'machineCount', e.target.value)} />
                <InputField label="Total Bags Produced" type="number" value={data.bags.finishedCount} onChange={(e) => onChange(data.id, 'bags', 'finishedCount', e.target.value)} />
                <SelectField label="Bags Per Pallet" value={data.bagsPerPallet} onChange={(e) => onChange(data.id, null, 'bagsPerPallet', e.target.value)} options={[65, 70, 80]} />
                <InputField label="Total Pallets Ran" type="number" value={data.totalPallets} readOnly={true} />
                <div className="mt-2 p-2 bg-gray-100 rounded-md text-center">
                    <span className="text-sm font-medium text-gray-600">Wasted Bags: </span>
                    <span className={`font-bold ${wastedBags < 0 ? 'text-red-500' : 'text-green-600'}`}>{wastedBags}</span>
                </div>
            </div>
        </div>

        {showRework && (
            <div className="mt-4 p-4 border border-yellow-400 bg-yellow-50 rounded-md">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Rework Information Required</h3>
                <p className="text-sm text-yellow-700 mb-2">Total bags produced exceeds machine count.</p>
                <TextAreaField label="Reason for Discrepancy" value={data.rework.reason} onChange={(e) => onChange(data.id, 'rework', 'reason', e.target.value)} />
                <InputField label="Amount of Rework Added" type="number" value={data.rework.amount} onChange={(e) => onChange(data.id, 'rework', 'amount', e.target.value)} />
            </div>
        )}
        
        <div className="mt-6">
            <TextAreaField label="Additional Notes" value={data.notes} onChange={(e) => onChange(data.id, null, 'notes', e.target.value)} />
        </div>
      </Card>
    );
});

const MachineSettings = React.memo(function MachineSettings({ settings, onSettingsChange }) {
    return (
    <Card>
        <SectionTitle>Machine Settings for the Day</SectionTitle>
        <p className="text-sm text-gray-500 mb-4">Please enter the machine settings for one of the products run today.</p>
        <InputField 
            label="Product Name During Settings Capture" 
            value={settings.productName} 
            onChange={(e) => onSettingsChange('machineSettings', 'productName', e.target.value)} 
            required 
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <InputField label="Setting A" value={settings.settingA} onChange={(e) => onSettingsChange('machineSettings', 'settingA', e.target.value)} />
            <InputField label="Setting B" value={settings.settingB} onChange={(e) => onSettingsChange('machineSettings', 'settingB', e.target.value)} />
            <InputField label="Setting C" value={settings.settingC} onChange={(e) => onSettingsChange('machineSettings', 'settingC', e.target.value)} />
        </div>
    </Card>
    );
});


// Main Application Component
export default function App() {
  const [reportData, setReportData] = useState({
    date: new Date().toISOString().split('T')[0],
    crew: { lineOperator: '', forkliftOperator: '', loaderOperator: '' },
    shift: { startTime: '', stopTime: '' },
    productionLine: 'Line 1',
    downtimes: [{ id: Date.now(), time: '', productName: '', reason: '', parts: '', duration: '0-5 mins' }],
    workOrders: [{ id: Date.now(), number: '', operatorName: '' }],
    productRuns: [
      {
        id: Date.now(),
        productName: '',
        bags: { machineCount: '0', finishedCount: '0' },
        bagsPerPallet: 65,
        totalPallets: 0,
        rework: { reason: '', amount: 0 },
        timestamps: { startTime: '', endTime: '' },
        notes: ''
      }
    ],
    machineSettings: {
        productName: '',
        settingA: '',
        settingB: '',
        settingC: ''
    }
  });

  const [activeTabId, setActiveTabId] = useState(0); // 0 for Main Info, id for run, 'settings' for settings

  const totalMachineCount = useMemo(() => {
    return reportData.productRuns.reduce((total, run) => {
      return total + (Number(run.bags.machineCount) || 0);
    }, 0);
  }, [reportData.productRuns]);

  const handleMainInfoChange = useCallback((section, field, value) => {
    setReportData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  }, []);
  
  const handleDateChange = useCallback((e) => {
      setReportData(prev => ({ ...prev, date: e.target.value }));
  }, []);
  
  const handleProductionLineChange = useCallback((e) => {
    setReportData(prev => ({...prev, productionLine: e.target.value}));
  }, []);

  const handleProductRunChange = useCallback((id, section, field, value) => {
    setReportData(prev => ({
        ...prev,
        productRuns: prev.productRuns.map(run => {
            if (run.id !== id) return run;

            let processedValue = value;
            if (section === 'bags' && (field === 'machineCount' || field === 'finishedCount')) {
                if (value === '' || value === '0') {
                    processedValue = value;
                } else {
                    const num = parseInt(value.replace(/^0+/, ''), 10);
                    processedValue = isNaN(num) ? '' : String(num);
                }
            }

            if (section) {
                return {
                    ...run,
                    [section]: {
                        ...run[section],
                        [field]: processedValue,
                    },
                };
            } else {
                return {
                    ...run,
                    [field]: processedValue,
                };
            }
        }),
    }));
  }, []);
  
  const handleDowntimeChange = useCallback((id, field, value) => {
    setReportData(prev => ({
      ...prev,
      downtimes: prev.downtimes.map(downtime => 
        downtime.id === id ? { ...downtime, [field]: value } : downtime
      )
    }));
  }, []);
  
  const addDowntime = useCallback(() => {
    setReportData(prev => ({
      ...prev,
      downtimes: [...prev.downtimes, { id: Date.now(), time: '', productName: '', reason: '', parts: '', duration: '0-5 mins' }]
    }));
  }, []);

  const removeDowntime = useCallback((idToRemove) => {
    setReportData(prev => ({
      ...prev,
      downtimes: prev.downtimes.filter(downtime => downtime.id !== idToRemove)
    }));
  }, []);

  const handleWorkOrderChange = useCallback((id, field, value) => {
    setReportData(prev => ({
      ...prev,
      workOrders: prev.workOrders.map(wo => 
        wo.id === id ? { ...wo, [field]: value } : wo
      )
    }));
  }, []);

  const addWorkOrder = useCallback(() => {
    setReportData(prev => ({
      ...prev,
      workOrders: [...prev.workOrders, { id: Date.now(), number: '', operatorName: '' }]
    }));
  }, []);

  const removeWorkOrder = useCallback((idToRemove) => {
    setReportData(prev => ({
      ...prev,
      workOrders: prev.workOrders.filter(wo => wo.id !== idToRemove)
    }));
  }, []);

  const addProductRun = useCallback(() => {
      const newRun = {
        id: Date.now(),
        productName: '',
        bags: { machineCount: '0', finishedCount: '0' },
        bagsPerPallet: 65,
        totalPallets: 0,
        rework: { reason: '', amount: 0 },
        timestamps: { startTime: '', endTime: '' },
        notes: ''
      };

    setReportData(prev => ({
      ...prev,
      productRuns: [...prev.productRuns, newRun]
    }));
    setActiveTabId(newRun.id);
  }, []);

  const removeProductRun = useCallback((idToRemove) => {
    setReportData(prev => {
        if (prev.productRuns.length <= 1) {
            alert("You must have at least one product run for the day.");
            return prev;
        }
        const newProductRuns = prev.productRuns.filter(run => run.id !== idToRemove);
        if (activeTabId === idToRemove) {
            setActiveTabId(0); // Go back to main info tab if active one is deleted
        }
        return {
            ...prev,
            productRuns: newProductRuns
        };
    });
  }, [activeTabId]);
  
  const handleSubmit = (e) => {
      e.preventDefault();
      // Validation for machine settings
      const { productName, ...settings } = reportData.machineSettings;
      const hasMachineSettings = productName.trim() !== '' && Object.values(settings).some(s => s.trim() !== '');

      if (!hasMachineSettings) {
          alert("Please enter the product name and at least one machine setting for the day.");
          setActiveTabId('settings');
          return;
      }
      
      console.log('Submitting Report:', reportData);
      alert('Production report submitted successfully!');
      // Here you would typically send the data to a server or Google Sheets
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Daily Production Report</h1>
          <p className="text-gray-500">Fill out the details for today's production shift.</p>
        </header>

        <form onSubmit={handleSubmit}>
            <div className="flex border-b border-gray-300 mb-4 overflow-x-auto">
              <Tab label="Main Info" isActive={activeTabId === 0} onClick={() => setActiveTabId(0)} />
              {reportData.productRuns.map((run, index) => (
                <Tab
                  key={run.id}
                  label={`Product Run #${index + 1}`}
                  isActive={activeTabId === run.id}
                  onClick={() => setActiveTabId(run.id)}
                />
              ))}
              <Tab label="Machine Settings" isActive={activeTabId === 'settings'} onClick={() => setActiveTabId('settings')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div style={{ display: activeTabId === 0 ? 'block' : 'none' }}>
                        <MainInfo 
                            reportData={reportData}
                            onMainInfoChange={handleMainInfoChange}
                            onDateChange={handleDateChange}
                            onProductionLineChange={handleProductionLineChange}
                            totalBagsRan={totalMachineCount}
                            onAddDowntime={addDowntime}
                            onRemoveDowntime={removeDowntime}
                            onDowntimeChange={handleDowntimeChange}
                            onAddWorkOrder={addWorkOrder}
                            onRemoveWorkOrder={removeWorkOrder}
                            onWorkOrderChange={handleWorkOrderChange}
                        />
                    </div>
                    {reportData.productRuns.map((run, index) => (
                        <div key={run.id} style={{ display: activeTabId === run.id ? 'block' : 'none' }}>
                            <ProductRun
                                index={index}
                                data={run}
                                onRemove={removeProductRun}
                                canRemove={reportData.productRuns.length > 1}
                                onChange={handleProductRunChange}
                            />
                        </div>
                    ))}
                    <div style={{ display: activeTabId === 'settings' ? 'block' : 'none' }}>
                        <MachineSettings 
                            settings={reportData.machineSettings}
                            onSettingsChange={handleMainInfoChange}
                        />
                    </div>
                </div>
                
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <Card>
                        <SectionTitle>Actions</SectionTitle>
                        <button
                            type="button"
                            onClick={addProductRun}
                            className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition-colors duration-200 mb-4"
                        >
                            Add Additional Product Run
                        </button>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                        >
                            Submit Daily Report
                        </button>
                    </Card>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
}
