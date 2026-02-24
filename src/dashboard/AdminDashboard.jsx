import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackData } from "../apis/manageuser/manageuser";
import { Bar } from "react-chartjs-2";
import { FaStore, FaTag, FaUserEdit, FaSearch, FaHistory, FaPhoneAlt, FaMapMarkerAlt, FaFileExcel } from "react-icons/fa";
import { RefreshCw, ChevronRight, Database, Layout, Calendar } from "lucide-react";
import UniversalButton from "@/components/common/UniversalButton";
import toast from "react-hot-toast";
import moment from "moment";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await trackData();
      if (res.data.status === true) {
        setData(res.data?.data || []);
        setBrands(res?.data?.meta?.allBrands || []);
        // Set default selection to the first store with actual responses
        if (!selectedStore) {
          const firstWithData = res.data?.data?.find(s => s.total_responses > 0);
          setSelectedStore(firstWithData || res.data?.data[0]);
        }
      }
    } catch (error) {
      toast.error("Failed to sync Brand Tracking data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  // --- EXCELJS EXPORT LOGIC ---
  const handleExportExcel = async () => {
    if (!selectedStore || selectedStore.responses.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Submissions");

    // 1. Define Columns
    worksheet.columns = [
      { header: "Sr No", key: "srno", width: 10 },
      { header: "Store Name", key: "store", width: 25 },
      { header: "Consumer Name", key: "name", width: 25 },
      { header: "Contact Number", key: "contact", width: 20 },
      { header: "Brand", key: "brand", width: 15 },
      { header: "Gender", key: "gender", width: 12 },
      { header: "Age", key: "age", width: 10 },
      { header: "Pincode", key: "pin", width: 15 },
      { header: "Date", key: "date", width: 15 },
      { header: "Time", key: "time", width: 15 },
    ];

    // 2. Style the Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4F46E5" }, // Indigo Theme
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // 3. Add Data Rows
    selectedStore.responses.forEach((resp, index) => {
      const brandObj = brands.find(b => b.id === resp.brand_id);
      worksheet.addRow({
        srno: index + 1,
        store: selectedStore.user_name,
        name: resp.consumer_name,
        contact: resp.contact_number,
        brand: brandObj?.name || "N/A",
        gender: resp.gender,
        age: resp.age,
        pin: resp.pincode,
        date: moment(resp.created_at).format("DD-MM-YYYY"),
        time: moment(resp.created_at).format("hh:mm A"),
      });
    });

    // 4. Zebra Striping for Rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F9FAFB" },
        };
      }
    });

    // 5. Generate and Download
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `${selectedStore.user_name}_Submissions.xlsx`;
    saveAs(new Blob([buffer]), fileName);
    toast.success("Excel Report Exported!");
  };

  // --- BRAND ANALYTICS GRAPH DATA ---
  const brandChartData = useMemo(() => ({
    labels: brands.map(b => b.name),
    datasets: [{
      label: 'Total Form Submissions',
      data: brands.map(b => b.responses_count),
      backgroundColor: [
        'rgba(79, 70, 229, 0.8)', // Indigo
        'rgba(6, 182, 212, 0.8)', // Cyan
        'rgba(139, 92, 246, 0.8)', // Violet
        'rgba(236, 72, 153, 0.8)', // Pink
        'rgba(245, 158, 11, 0.8)', // Amber
        'rgba(16, 185, 129, 0.8)', // Emerald
        'rgba(59, 130, 246, 0.8)', // Blue
      ],
      borderRadius: 12,
      borderSkipped: false,
    }]
  }), [brands]);

  const filteredStores = data.filter(s => s.user_name.toLowerCase().includes(searchTerm.toLowerCase()));

  const DashboardSkeleton = () => (
    <div className="w-full max-w-[1600px] mx-auto p-4 lg:p-8 space-y-8 animate-pulse">
      <div className="bg-white p-8 rounded-[2.5rem] h-28 w-full shadow-sm" />
      <div className="h-80 bg-white rounded-[3rem] shadow-sm w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 h-[30rem] bg-white rounded-[2.5rem]" />
        <div className="lg:col-span-4 h-[30rem] bg-white rounded-[2.5rem]" />
      </div>
    </div>
  );

  if (loading && data.length === 0) return <DashboardSkeleton />;

  return (
    <div className="w-full min-h-screen bg-[#F0F2F5] p-4 lg:p-4 font-sans selection:bg-blue-100 rounded-2xl">
      <div className="max-w-[1600px] mx-auto">

        {/* --- PROFESSIONAL LOGO HEADER --- */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-white mb-8 flex flex-col md:flex-row justify-between items-center gap-6 flex-wrap">
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <div className="p-2  rounded-2xl">
              <img src="/vivologonew.png" alt="vivo" className="h-12 w-auto object-contain" />
            </div>
            <div className="h-12 w-[2px] bg-slate-100 hidden md:block"></div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 tracking-tight leading-none items-center">
                Yingjia Communication Pvt. Ltd.
              </h2>
              <p className="text-blue-600 text-[11px] font-medium uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                <Database size={12} /> Enterprise Brand Tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search store identity..."
                className="pl-12 pr-6 py-3 bg-slate-50 border-transparent rounded-2xl text-sm outline-none w-64 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <UniversalButton
              variant="primary"
              label="Sync Analytics"
              icon={<RefreshCw className={loading ? "animate-spin" : ""} size="18px" />}
              onClick={fetchData}
            />
          </div>
        </div>



        {/* --- TWO COLUMN DATA SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">

          {/* STORE LIST TABLE */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-[2.5rem] shadow-sm border border-white overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
                <FaStore className="text-blue-500" /> Store-Wise Link Tracking
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-medium tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Store Name</th>
                    <th className="px-8 py-5">Activity Count</th>
                    <th className="px-8 py-5 text-right text-nowrap">View Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStores.map((store) => (
                    <tr
                      key={store.user_id}
                      className={`group transition-all cursor-pointer hover:bg-blue-50/40 ${selectedStore?.user_id === store.user_id ? 'bg-blue-50/80' : ''}`}
                      onClick={() => setSelectedStore(store)}
                    >
                      <td className="px-8 py-6 font-bold text-slate-700 text-nowrap">{store.user_name}</td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-4 py-1 rounded-full text-[11px] text-nowrap font-medium ${store.total_responses > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {store.total_responses} Submissions
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="inline-flex p-2 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          <ChevronRight size={18} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RESPONSE FEED (DETAILS) */}
          <div className="lg:col-span-5 xl:col-span-4 h-full">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-white p-6 sticky top-5">
              <div className="flex items-center md:justify-between justify-center mb-8 flex-wrap gap-5 w-full">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
                  <FaHistory className="text-blue-500" /> Form Data Feed
                </h3>
                {selectedStore?.responses.length > 0 && (
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md cursor-pointer"
                  >
                    <FaFileExcel /> Export
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {selectedStore ? (
                  <motion.div key={selectedStore.user_id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                    {/* <div className="p-6 bg-[#4A5FA7] rounded-[2rem] text-white shadow-lg mb-6"> */}
                    <div className="p-6 bg-gray-900 rounded-[2rem] text-white shadow-lg mb-6">
                      <p className="text-[10px] font-medium uppercase opacity-40 mb-1 tracking-widest">Tracking Source</p>
                      <h4 className="text-xl font-bold truncate">{selectedStore.user_name}</h4>
                    </div>

                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedStore.responses.length > 0 ? selectedStore.responses.map((resp) => {
                        const brandObj = brands.find(b => b.id === resp.brand_id);
                        return (
                          <div key={resp.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-blue-200 transition-all relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
                                <FaUserEdit size={18} />
                              </div>
                              <span className="bg-blue-600 text-white text-[10px] font-semibold tracking-wider px-3 py-1 rounded-full uppercase">
                                {brandObj?.name || 'N/A'}
                              </span>
                            </div>
                            <p className="font-medium text-slate-800 text-sm mb-4">{resp.consumer_name}</p>
                            <div className="grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-4">
                              <div className="space-y-1">
                                <p className="text-[9px] font-medium text-slate-400 uppercase flex items-center gap-1"><FaPhoneAlt size={8} /> Phone</p>
                                <p className="text-xs font-bold text-slate-600">{resp.contact_number}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] font-medium text-slate-400 uppercase flex items-center gap-1"><Calendar size={8} /> Submitted At</p>
                                <p className="text-xs font-bold text-slate-600">{moment(resp.created_at).format("DD-MM-YYYY HH:mm A")}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] font-medium text-slate-400 uppercase flex items-center gap-1"><FaMapMarkerAlt size={8} /> Pin</p>
                                <p className="text-xs font-bold text-slate-600">{resp.pincode}</p>
                              </div>
                              <div className="col-span-2 flex gap-4 mt-2">
                                <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 uppercase">{resp.gender}</span>
                                <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 uppercase">{resp.age} Years</span>
                              </div>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="text-center py-20 opacity-40">
                          <Database size={40} className="mx-auto mb-4" />
                          <p className="font-bold text-sm">No submissions recorded at this store.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-20 text-slate-400 font-medium italic">
                    Select a tracking point to view consumer form submissions.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* --- BRAND ANALYTICS GRAPH (TOP FOCUS) --- */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-white mb-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
              <Layout className="text-blue-500" size={20} /> Overall Brand Submission Performance
            </h3>
            <div className="flex gap-2">
              <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-[10px] font-bold uppercase">
                {brands.length} Total Brands
              </span>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <Bar
              data={brandChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } },
                  x: { grid: { display: false }, border: { display: false } }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;