import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackData } from "../apis/manageuser/manageuser";
import { Bar } from "react-chartjs-2";
import { FaStore, FaUserEdit, FaSearch, FaHistory, FaPhoneAlt, FaMapMarkerAlt, FaFileExcel } from "react-icons/fa";
import { RefreshCw, ChevronRight, Database, Layout, Calendar } from "lucide-react";
import UniversalButton from "@/components/common/UniversalButton";
import UniversalSkeleton from "../components/ui/UniversalSkeleton";
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
      if (res.status === true) {
        setData(res.data || []);
        setBrands(res.meta?.allBrands || []);
        if (!selectedStore) {
          const firstWithData = res.data.find(s => s.total_responses > 0);
          setSelectedStore(firstWithData || res.data[0]);
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

  const brandChartData = useMemo(() => ({
    labels: brands.map(b => b.name),
    datasets: [{
      label: 'Submissions',
      data: brands.map(b => b.responses_count),
      backgroundColor: 'rgba(79, 70, 229, 0.8)',
      borderRadius: 12,
    }]
  }), [brands]);

  const filteredStores = data.filter(s => s.user_name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading && data.length === 0) return <div className="p-8 animate-pulse"><UniversalSkeleton height="80vh" width="100%" className="rounded-[3rem]"/></div>;

  return (
    <div className="w-full min-h-screen bg-[#F0F2F5] p-4 lg:p-6 font-sans rounded-2xl">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-white mb-8 flex justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <img src="/vivologonew.png" alt="vivo" className="h-12 w-auto" />
            <h2 className="text-2xl font-semibold text-slate-800">Yingjia Communication Pvt. Ltd.</h2>
          </div>
          <UniversalButton
            variant="primary"
            label="Sync Data"
            icon={<RefreshCw className={loading ? "animate-spin" : ""} size="18px" />}
            onClick={fetchData}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          {/* Store List */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-sm border border-white overflow-hidden">
             <div className="p-8 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
                <FaStore className="text-blue-500" /> Store-Wise Link Tracking
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-medium tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Store Name</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStores.map((store) => (
                    <tr
                      key={store.user_id}
                      className={`cursor-pointer transition-all ${selectedStore?.user_id === store.user_id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                      onClick={() => setSelectedStore(store)}
                    >
                      <td className="px-8 py-6 font-bold text-slate-700">{store.user_name}</td>
                      <td className="px-8 py-6 text-right">
                        <ChevronRight size={18} className="inline text-slate-300" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details Feed with Excel Button */}
          <div className="lg:col-span-4 h-full">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-white p-6 sticky top-5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <FaHistory className="text-blue-500" /> Feed
                </h3>
                {selectedStore?.responses.length > 0 && (
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md"
                  >
                    <FaFileExcel /> Export
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {selectedStore ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="p-6 bg-gray-900 rounded-[2rem] text-white mb-6">
                      <h4 className="text-xl font-bold truncate">{selectedStore.user_name}</h4>
                    </div>

                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedStore.responses.map((resp) => (
                        <div key={resp.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                          <p className="font-medium text-slate-800 text-sm mb-4">{resp.consumer_name}</p>
                          <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-500">
                             <div className="flex items-center gap-1"><FaPhoneAlt size={10} /> {resp.contact_number}</div>
                             <div className="flex items-center gap-1"><FaMapMarkerAlt size={10} /> {resp.pincode}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-20 text-slate-400 italic">Select a store</div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Brand Chart */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-white mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-8 flex items-center gap-3">
            <Layout className="text-blue-500" size={20} /> Overall Brand Performance
          </h3>
          <div className="h-[320px] w-full">
            <Bar data={brandChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }}}} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;