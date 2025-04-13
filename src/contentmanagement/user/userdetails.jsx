import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import axios from "axios";

const Userdetails = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      {/* Content */}
      <div className="content-container flex-1 min-w-0 bg-[#f5f6fa] p-6">
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
          </div>

          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.first_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Userdetails;
