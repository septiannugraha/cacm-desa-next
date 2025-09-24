'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Settings,
  Bell,
  Shield,
  Database,
  Palette,
  Monitor,
  Moon,
  Sun,
  Save
} from 'lucide-react'

export default function SettingsPage() {
  useSession()
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    language: 'id',
    timezone: 'Asia/Jakarta',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    emailNotifications: true,
    pushNotifications: false,
    atensiNotifications: true,
    reportNotifications: true,
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '90',
  })

  const tabs = [
    { id: 'general', label: 'Umum', icon: Settings },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'appearance', label: 'Tampilan', icon: Palette },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'data', label: 'Data & Backup', icon: Database },
  ]

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-600 mt-1">
          Kelola preferensi dan konfigurasi aplikasi
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
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

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Pengaturan Umum</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bahasa
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="id">Bahasa Indonesia</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zona Waktu
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Asia/Jakarta">WIB - Jakarta</option>
                      <option value="Asia/Makassar">WITA - Makassar</option>
                      <option value="Asia/Jayapura">WIT - Jayapura</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Format Tanggal
                    </label>
                    <select
                      value={settings.dateFormat}
                      onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Pengaturan Notifikasi</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Notifikasi Email</p>
                      <p className="text-sm text-gray-500">Terima notifikasi melalui email</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-500">Notifikasi desktop/mobile</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, pushNotifications: !settings.pushNotifications })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Notifikasi Atensi</p>
                      <p className="text-sm text-gray-500">Pemberitahuan atensi baru dan update</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, atensiNotifications: !settings.atensiNotifications })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.atensiNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.atensiNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Pengaturan Tampilan</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Tema
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setSettings({ ...settings, theme: 'light' })}
                        className={`p-4 border-2 rounded-lg transition-colors ${
                          settings.theme === 'light'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Sun className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm font-medium">Terang</p>
                      </button>
                      <button
                        onClick={() => setSettings({ ...settings, theme: 'dark' })}
                        className={`p-4 border-2 rounded-lg transition-colors ${
                          settings.theme === 'dark'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Moon className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm font-medium">Gelap</p>
                      </button>
                      <button
                        onClick={() => setSettings({ ...settings, theme: 'system' })}
                        className={`p-4 border-2 rounded-lg transition-colors ${
                          settings.theme === 'system'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Monitor className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-sm font-medium">Sistem</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Pengaturan Keamanan</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Untuk mengubah pengaturan keamanan, silakan hubungi administrator sistem.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Sesi Login</p>
                    <p className="text-sm text-gray-500">Otomatis logout setelah 30 menit tidak aktif</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Password Policy</p>
                    <p className="text-sm text-gray-500">Minimal 8 karakter dengan kombinasi huruf dan angka</p>
                  </div>
                </div>
              </div>
            )}

            {/* Data Settings */}
            {activeTab === 'data' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Data & Backup</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Auto Backup</p>
                      <p className="text-sm text-gray-500">Backup otomatis data sistem</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, autoBackup: !settings.autoBackup })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frekuensi Backup
                    </label>
                    <select
                      value={settings.backupFrequency}
                      onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                      disabled={!settings.autoBackup}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    >
                      <option value="daily">Harian</option>
                      <option value="weekly">Mingguan</option>
                      <option value="monthly">Bulanan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retensi Data (hari)
                    </label>
                    <input
                      type="number"
                      value={settings.dataRetention}
                      onChange={(e) => setSettings({ ...settings, dataRetention: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}