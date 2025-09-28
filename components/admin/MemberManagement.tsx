import React from 'react';
import { UserCircleIcon } from '../icons';

const mockMembers = [
    { id: 1, name: 'John Kamau', idNumber: '12345678', status: 'Active', compliance: '100%' },
    { id: 2, name: 'Peter Omondi', idNumber: '87654321', status: 'Active', compliance: '100%' },
    { id: 3, name: 'Mary Wanjiru', idNumber: '11223344', status: 'Suspended', compliance: '50%' },
    { id: 4, name: 'David Mwangi', idNumber: '44332211', status: 'Active', compliance: '100%' },
];

const MemberManagement: React.FC = () => {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <UserCircleIcon className="w-6 h-6" />
                Member Management
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900/50 text-slate-400 uppercase">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">ID Number</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Compliance</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockMembers.map(member => (
                            <tr key={member.id} className="border-b border-slate-700 last:border-0">
                                <td className="p-3 font-medium text-white">{member.name}</td>
                                <td className="p-3">{member.idNumber}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${member.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {member.status}
                                    </span>
                                </td>
                                <td className="p-3">{member.compliance}</td>
                                <td className="p-3">
                                    <button className="text-brand-blue hover:underline">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MemberManagement;