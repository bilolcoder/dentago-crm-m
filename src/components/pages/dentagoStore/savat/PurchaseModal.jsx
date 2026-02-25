import React from "react";
import { useForm } from "react-hook-form";
// import { useSocket } from "../context/SocketContext"; // Adjust path if needed
import { X, ShoppingCart, User, MapPin, Smartphone } from 'lucide-react';

const PurchaseModal = ({
    open,
    onClose,
    selectedItemsList = [],
    selectedCount = 0,
    selectedTotal = 0,
    paymentMethods = [],
    defaultForm = {},
    locationStatus,
    showLocationPermission,
    setShowLocationPermission,
    isGettingLocation,
    getCurrentLocation
}) => {
    // const socket = useSocket();
    const { register, handleSubmit } = useForm({ defaultValues: defaultForm });

    // Example socket logic (uncomment and adjust as needed)
    /*
    useEffect(() => {
      if (!socket) return;
      socket.emit("payment:subscribe", { orderId: "demoOrderId" });
      const handleSuccess = (data) => { console.log("SUCCESS:", data); };
      const handleFailed = (data) => { console.log("FAILED:", data); };
      socket.on("payment_success", handleSuccess);
      socket.on("payment_failed", handleFailed);
      return () => {
        socket.off("payment_success", handleSuccess);
        socket.off("payment_failed", handleFailed);
      };
    }, [socket]);
    */

    const onSubmit = (data) => {
        console.log("Form values:", data);
        // You can trigger payment logic here
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* You can add location permission UI here if needed */}
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-5 rounded-t-2xl z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#00C2FF] p-2.5 rounded-xl">
                                <ShoppingCart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Buyurtma berish</h2>
                                <p className="text-xs text-gray-500">{selectedItemsList.length} ta mahsulot</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            <User className="w-3.5 h-3.5 inline mr-1" /> Ism Familiya
                        </label>
                        <input {...register("fullName")} type="text" className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 outline-none" placeholder="Ali Valiyev" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            <Smartphone className="w-3.5 h-3.5 inline mr-1" /> Telefon
                        </label>
                        <input {...register("phone")} type="tel" className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 outline-none" placeholder="+998 88 306 26 99" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            <MapPin className="w-3.5 h-3.5 inline mr-1" /> Yetkazib berish manzili
                        </label>
                        <textarea {...register("address")} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none resize-none pr-12 focus:border-[#00C2FF] transition-colors" placeholder="Manzilni kiriting" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-3">To'lov usulini tanlang</label>
                        <div className="grid grid-cols-3 gap-3">
                            {paymentMethods.map((method) => (
                                <button key={method.id} type="button" onClick={() => { }} className="cursor-pointer">
                                    <div className={`relative p-3 rounded-xl transition-all`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-xs font-bold`}>{method.name}</span>
                                            <div className="w-8 h-5 rounded flex items-center justify-center bg-white">
                                                <img src={method.icon} alt={method.name} className="w-6 h-4 object-contain" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer text-sm">Bekor qilish</button>
                        <button type="submit" className="flex-1 py-3 px-4 bg-[#00C2FF] text-white rounded-xl font-bold hover:bg-[#0099DD] hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm">Sotib olish</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PurchaseModal;
