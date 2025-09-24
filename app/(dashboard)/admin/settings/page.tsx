'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import {
  Settings,
  Database,
  Shield,
  Globe,
  Bell,
  Mail,
  Save,
  Server,
  Key,
  Users,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function AdminSettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('system')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  
  // Check if user is admin
  if (session?.user?.roleCode !== 'ADMIN') {
    redirect('/dashboard')
  }

  const [settings, setSettings] = useState({
    // System Settings
    siteName: 'CACM Desa',
    siteDescription: 'Continuous Audit Continuous Monitoring - Pengelolaan Keuangan Desa',
    maintenanceMode: false,
    debugMode: false,
    maxUploadSize: '10',
    sessionTimeout: '30',
    
    // Database Settings  
    dbBackupEnabled: true,
    dbBackupSchedule: 'daily',
    dbBackupRetention: '30',
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@cacmdesa.go.id',
    smtpFrom: 'CACM Desa System',
    emailEnabled: true,
    
    // Security Settings
    passwordMinLength: '8',
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordExpiry: '90',
    maxLoginAttempts: '5',
    lockoutDuration: '30',
    twoFactorEnabled: false,
    
    // Audit Settings
    auditLogEnabled: true,
    auditRetention: '365',
    logUserActivity: true,
    logSystemEvents: true,
    logSecurityEvents: true,
  })

  const tabs = [
    { id: 'system', label: 'Sistem', icon: Settings },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'audit', label: 'Audit Log', icon: FileText },
  ]

  const handleSave = async () => {
    setSaveStatus('saving')
    // Simulate save
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Admin</h1>
        <p className="text-gray-600 mt-1">
          Konfigurasi sistem dan pengaturan aplikasi tingkat administrator
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900">Perhatian</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Perubahan pada pengaturan ini dapat mempengaruhi seluruh sistem. 
              Pastikan Anda memahami dampak dari setiap perubahan.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow">
            {/* System Settings */}
            {activeTab === 'system' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Pengaturan Sistem</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Situs
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi Situs
                    </label>
                    <textarea
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Upload Size (MB)
                      </label>
                      <input
                        type="number"
                        value={settings.maxUploadSize}
                        onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (menit)
                      </label>
                      <input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Mode Maintenance</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.debugMode}
                        onChange={(e) => setSettings({ ...settings, debugMode: e.target.checked })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Mode Debug</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Database Settings */}
            {activeTab === 'database' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Pengaturan Database</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Auto Backup Database</p>
                      <p className="text-sm text-gray-500">Backup otomatis database sistem</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, dbBackupEnabled: !settings.dbBackupEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.dbBackupEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.dbBackupEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jadwal Backup
                    </label>
                    <select
                      value={settings.dbBackupSchedule}
                      onChange={(e) => setSettings({ ...settings, dbBackupSchedule: e.target.value })}
                      disabled={!settings.dbBackupEnabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    >
                      <option value="hourly">Setiap Jam</option>
                      <option value="daily">Harian</option>
                      <option value="weekly">Mingguan</option>
                      <option value="monthly">Bulanan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retensi Backup (hari)
                    </label>
                    <input
                      type="number"
                      value={settings.dbBackupRetention}
                      onChange={(e) => setSettings({ ...settings, dbBackupRetention: e.target.value })}
                      disabled={!settings.dbBackupEnabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Server className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Database Info</p>
                        <p className="text-sm text-blue-700 mt-1">Type: SQL Server</p>
                        <p className="text-sm text-blue-700">Size: 245 MB</p>
                        <p className="text-sm text-blue-700">Last Backup: 2024-03-20 02:00:00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Pengaturan Email</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Aktifkan pengiriman email</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, emailEnabled: !settings.emailEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.emailEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.smtpHost}
                        onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                        disabled={!settings.emailEnabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="text"
                        value={settings.smtpPort}
                        onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                        disabled={!settings.emailEnabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email User
                    </label>
                    <input
                      type="email"
                      value={settings.smtpUser}
                      onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                      disabled={!settings.emailEnabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={settings.smtpFrom}
                      onChange={(e) => setSettings({ ...settings, smtpFrom: e.target.value })}
                      disabled={!settings.emailEnabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Pengaturan Keamanan</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min. Panjang Password
                      </label>
                      <input
                        type="number"
                        value={settings.passwordMinLength}
                        onChange={(e) => setSettings({ ...settings, passwordMinLength: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Expiry (hari)
                      </label>
                      <input
                        type="number"
                        value={settings.passwordExpiry}
                        onChange={(e) => setSettings({ ...settings, passwordExpiry: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.passwordRequireUppercase}
                        onChange={(e) => setSettings({ ...settings, passwordRequireUppercase: e.target.checked })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Wajib huruf besar</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.passwordRequireNumbers}
                        onChange={(e) => setSettings({ ...settings, passwordRequireNumbers: e.target.checked })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Wajib angka</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorEnabled}
                        onChange={(e) => setSettings({ ...settings, twoFactorEnabled: e.target.checked })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => setSettings({ ...settings, maxLoginAttempts: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lockout Duration (menit)
                      </label>
                      <input
                        type="number"
                        value={settings.lockoutDuration}
                        onChange={(e) => setSettings({ ...settings, lockoutDuration: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Settings */}
            {activeTab === 'audit' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Pengaturan Audit Log</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Audit Logging</p>
                      <p className="text-sm text-gray-500">Catat semua aktivitas sistem</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, auditLogEnabled: !settings.auditLogEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.auditLogEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.auditLogEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retensi Log (hari)
                    </label>
                    <input
                      type="number"
                      value={settings.auditRetention}
                      onChange={(e) => setSettings({ ...settings, auditRetention: e.target.value })}
                      disabled={!settings.auditLogEnabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.logUserActivity}
                        onChange={(e) => setSettings({ ...settings, logUserActivity: e.target.checked })}
                        disabled={!settings.auditLogEnabled}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm font-medium text-gray-700">Log aktivitas pengguna</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.logSystemEvents}
                        onChange={(e) => setSettings({ ...settings, logSystemEvents: e.target.checked })}
                        disabled={!settings.auditLogEnabled}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm font-medium text-gray-700">Log event sistem</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.logSecurityEvents}
                        onChange={(e) => setSettings({ ...settings, logSecurityEvents: e.target.checked })}
                        disabled={!settings.auditLogEnabled}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm font-medium text-gray-700">Log event keamanan</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  {saveStatus === 'saved' && (
                    <span className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      Pengaturan berhasil disimpan
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saveStatus === 'saving' ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}