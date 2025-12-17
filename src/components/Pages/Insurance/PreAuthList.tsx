import React, { useEffect, useState } from "react";
import { insuranceApi } from "../../../api/insurance.api";
import { Search, Loader2 } from "lucide-react";

interface PreAuth {
    authorizationNumber: string;
    patientId?: {
        firstName: string;
        lastName: string;
        patientCode: string;
    };
    insuranceId?: {
        insuranceProvider: string;
        policyNumber: string;
    };
    procedureCodes: {
        cpt: string;
        charges: number;
    }[];
    requestedAmount: number;
    approvedAmount?: number;
    status: "Pending" | "Approved" | "Rejected";
    hospitalName: string;
    providerName: string; // Doctor Name
    createdAt: string;
}

const PreAuthList: React.FC = () => {
    const [data, setData] = useState<PreAuth[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await insuranceApi.getPreAuthorizations();
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = data.filter((item) => {
        const term = searchTerm.toLowerCase();
        return (
            item.authorizationNumber.toLowerCase().includes(term) ||
            item.patientId?.firstName.toLowerCase().includes(term) ||
            item.patientId?.lastName.toLowerCase().includes(term) ||
            item.providerName.toLowerCase().includes(term)
        );
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pre-Authorizations</h1>
                    <p className="text-sm text-gray-500">
                        Manage incoming authorization requests from hospitals.
                    </p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Auth # or Patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-full w-64 focus:ring-2 focus:ring-blue-100 focus:outline-none text-sm transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No pre-authorization requests found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3">Auth #</th>
                                <th className="px-4 py-3">Patient</th>
                                <th className="px-4 py-3">Provider / Doctor</th>
                                <th className="px-4 py-3">Hospital</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                        {item.authorizationNumber}
                                        <div className="text-[10px] text-gray-400">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-700">
                                            {item.patientId?.firstName} {item.patientId?.lastName}
                                        </p>
                                        <span className="text-xs text-gray-400">
                                            {item.patientId?.patientCode}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {item.providerName}
                                        <span className="block text-[10px] text-gray-400">
                                            {item.procedureCodes.length} procedures
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 font-medium">
                                        {item.hospitalName}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-700">
                                        ₹{item.requestedAmount.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-bold border ${item.status === "Approved"
                                                    ? "bg-green-50 text-green-600 border-green-200"
                                                    : item.status === "Rejected"
                                                        ? "bg-red-50 text-red-600 border-red-200"
                                                        : "bg-yellow-50 text-yellow-600 border-yellow-200"
                                                }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PreAuthList;
