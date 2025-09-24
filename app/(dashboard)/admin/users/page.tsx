'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import {
  Users,
  Search,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Key
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

// interface User {
//   id: string
//   username: string
//   email: string | null
//   name: string
//   role: string
//   active: boolean
//   lastLogin: Date | null
// }

const roleConfig = {
  ADMIN: { label: 'Administrator', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Shield },
  INSPECTOR: { label: 'Inspektor', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: CheckCircle },
  USER: { label: 'Pengguna', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Users },
}

export default function UsersPage() {
  const { data: session } = useSession()
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  // const [showUserModal] = useState(false) // For future use
  // const [selectedUser] = useState<any>(null) // For future use

  // Check if user is admin
  if (session?.user?.roleCode !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Mock data - replace with actual API call
  const users = [
    {
      id: '1',
      username: 'ahmad.fauzi',
      name: 'Ahmad Fauzi',
      email: 'ahmad.fauzi@example.com',
      role: 'INSPECTOR',
      roleCode: 'INSPECTOR',
      pemda: 'Kabupaten Bandung',
      isActive: true,
      createdAt: '2024-01-15',
      lastLogin: '2024-03-20T10:30:00',
    },
    {
      id: '2',
      username: 'siti.rahayu',
      name: 'Siti Rahayu',
      email: 'siti.rahayu@example.com',
      role: 'USER',
      roleCode: 'USER',
      pemda: 'Kabupaten Bandung',
      isActive: true,
      createdAt: '2024-02-10',
      lastLogin: '2024-03-19T14:20:00',
    },
    {
      id: '3',
      username: 'budi.santoso',
      name: 'Budi Santoso',
      email: 'budi.santoso@example.com',
      role: 'ADMIN',
      roleCode: 'ADMIN',
      pemda: 'Provinsi Jawa Barat',
      isActive: false,
      createdAt: '2023-11-20',
      lastLogin: '2024-02-15T09:15:00',
    },
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                          user.email.toLowerCase().includes(search.toLowerCase()) ||
                          user.username.toLowerCase().includes(search.toLowerCase())
    const matchesRole = !selectedRole || user.roleCode === selectedRole
    const matchesStatus = !selectedStatus || 
                         (selectedStatus === 'active' && user.isActive) ||
                         (selectedStatus === 'inactive' && !user.isActive)
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-600 mt-1">
            Kelola pengguna dan hak akses sistem
          </p>
        </div>
        {/* Button disabled - modal functionality not implemented yet
        <button
          onClick={() => {
            setSelectedUser(null)
            setShowUserModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Pengguna
        </button>
        */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-600">Total Pengguna</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.isActive).length}
              </p>
              <p className="text-sm text-gray-600">Pengguna Aktif</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.roleCode === 'ADMIN').length}
              </p>
              <p className="text-sm text-gray-600">Administrator</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Role</option>
            {Object.entries(roleConfig).map(([value, config]) => (
              <option key={value} value={value}>{config.label}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pengguna
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pemda
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Login Terakhir
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => {
              const RoleIcon = roleConfig[user.roleCode as keyof typeof roleConfig]?.icon || Users
              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${roleConfig[user.roleCode as keyof typeof roleConfig]?.color || ''}`}>
                      <RoleIcon className="w-3 h-3" />
                      {roleConfig[user.roleCode as keyof typeof roleConfig]?.label || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.pemda}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-300">
                        <CheckCircle className="w-3 h-3" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 border border-red-300">
                        <XCircle className="w-3 h-3" />
                        Tidak Aktif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin && format(new Date(user.lastLogin), 'dd MMM yyyy HH:mm', { locale: id })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* Edit button disabled - modal functionality not implemented yet
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowUserModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      */}
                      <button className="text-yellow-600 hover:text-yellow-900">
                        <Key className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}