'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { FiSearch, FiX, FiChevronDown } from 'react-icons/fi'

type ProvOpt = { provinsi: string; Kd_Prov: string }
type PemdaOpt = { namapemda: string; Kd_Pemda: string }
type KecOpt  = { kecamatan: string; Kd_Kec: string }
type DesaOpt = { desa: string; Kd_Desa: string }
type SDOpt   = { sumberdana: string; Kode: string }

type FilterDataProps = {
  provinsi: ProvOpt[]
  pemda: PemdaOpt[]
  kecamatan: KecOpt[]
  desa: DesaOpt[]
  sumberdana: SDOpt[]
}

type SelectedProps = {
  provinsi: string
  pemda: string
  kecamatan: string
  desa: string
  sumberdana: string
}

type Loaders = {
  provinsi?: () => void
  pemda?: () => void
  kecamatan?: () => void
  desa?: () => void
  sumberdana?: () => void
}

/** Reusable searchable select (tanpa library) */
function SearchableSelect<T>({
  label,
  placeholder,
  value,
  onChange,
  options,
  getKey,
  getLabel,
  disabled,
  onOpen,
  ensureAllLoaded, // <— tambahan: dipanggil saat user mengetik jika list terasa belum penuh
}: {
  label: string
  placeholder: string
  value: string
  onChange: (val: string) => void
  options: T[]
  getKey: (o: T) => string
  getLabel: (o: T) => string
  disabled?: boolean
  onOpen?: () => void
  ensureAllLoaded?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => getLabel(o).toLowerCase().includes(q))
  }, [options, query, getLabel])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  // Ketika panel dibuka, pastikan data diload
  useEffect(() => {
    if (open) onOpen?.()
  }, [open, onOpen])

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((s) => !s)}
        className={`w-full border px-3 py-2 rounded-lg flex items-center justify-between ${disabled ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`truncate ${!value ? 'text-gray-400' : ''}`}>
          {value ? (getLabel(options.find((o) => getKey(o) === value) as T) || '') : placeholder}
        </span>
        <FiChevronDown />
      </button>

      {open && !disabled && (
        <div className="mt-2 bg-white border rounded-lg shadow-lg p-2 max-h-72 overflow-auto z-50 relative">
          <div className="flex items-center gap-2 px-2 py-1 border rounded-md mb-2">
            <FiSearch className="text-gray-500" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                // kalau opsi masih sedikit (mis. baru seed 1 item), paksa load full list
                if ((options?.length ?? 0) < 10) ensureAllLoaded?.()
              }}
              placeholder={`Cari ${label.toLowerCase()}...`}
              className="w-full outline-none py-1"
            />
            {query && (
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setQuery('')} aria-label="Bersihkan pencarian">
                <FiX />
              </button>
            )}
          </div>
          <ul role="listbox" className="divide-y">
            <li
              role="option"
              aria-selected={!value}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${!value ? 'bg-blue-50' : ''}`}
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              Semua {label}
            </li>
            {filtered.map((opt) => {
              const k = getKey(opt)
              const lbl = getLabel(opt)
              const selected = value === k
              return (
                <li
                  key={k}
                  role="option"
                  aria-selected={selected}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${selected ? 'bg-blue-50 font-medium' : ''}`}
                  onClick={() => {
                    onChange(k)
                    setOpen(false)
                  }}
                  title={lbl}
                >
                  {lbl}
                </li>
              )
            })}
            {!filtered.length && (
              <li className="px-3 py-2 text-gray-500 text-sm">Tidak ada hasil</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function FilterModal({
  show,
  onClose,
  filterData,
  selected,
  setSelected,
  onApply,
  onClear,
  loaders
}: {
  show: boolean
  onClose: () => void
  filterData: FilterDataProps
  selected: SelectedProps
  setSelected: (next: SelectedProps) => void
  onApply: () => void
  onClear: () => void
  loaders?: Loaders
}) {
  // Tutup jika klik overlay
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if ((e.target as HTMLElement).id === 'modal-overlay') onClose()
    }
    window.addEventListener('click', handleOutside)
    return () => window.removeEventListener('click', handleOutside)
  }, [onClose])

   
 
  const update = (key: keyof SelectedProps, value: string) => {
    const next: SelectedProps = { ...selected, [key]: value }
    if (key === 'provinsi') {
      next.pemda = ''
      next.kecamatan = ''
      next.desa = ''
    }
    if (key === 'pemda') {
      next.kecamatan = ''
      next.desa = ''
    }
    if (key === 'kecamatan') {
      next.desa = ''
    }
    setSelected(next)
  }

  const pemdaDisabled = !selected.provinsi
  const kecDisabled   = !selected.pemda
  const desaDisabled  = !selected.kecamatan

  return show ? (
    <div id="modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Filter Data</h3>
          <button onClick={onClose} aria-label="Tutup"><FiX size={20} /></button>
        </div>

        <div className="space-y-4">
          <SearchableSelect<ProvOpt>
            label="Provinsi"
            placeholder="Semua Provinsi"
            value={selected.provinsi}
            onChange={(v) => update('provinsi', v)}
            options={filterData.provinsi}
            getKey={(o) => o.Kd_Prov}
            getLabel={(o) => o.provinsi}
            onOpen={loaders?.provinsi}
            ensureAllLoaded={loaders?.provinsi}
          />

          <SearchableSelect<PemdaOpt>
            label="Pemda"
            placeholder="Semua Pemda"
            value={selected.pemda}
            onChange={(v) => update('pemda', v)}
            options={filterData.pemda}
            getKey={(o) => o.Kd_Pemda}
            getLabel={(o) => o.namapemda}
            disabled={pemdaDisabled}
            onOpen={loaders?.pemda}
            ensureAllLoaded={loaders?.pemda}
          />

          <SearchableSelect<KecOpt>
            label="Kecamatan"
            placeholder="Semua Kecamatan"
            value={selected.kecamatan}
            onChange={(v) => update('kecamatan', v)}
            options={filterData.kecamatan}
            getKey={(o) => o.Kd_Kec}
            getLabel={(o) => o.kecamatan}
            disabled={kecDisabled}
            onOpen={loaders?.kecamatan}
            ensureAllLoaded={loaders?.kecamatan}
          />

          <SearchableSelect<DesaOpt>
            label="Desa"
            placeholder="Semua Desa"
            value={selected.desa}
            onChange={(v) => update('desa', v)}
            options={filterData.desa}
            getKey={(o) => o.Kd_Desa}
            getLabel={(o) => o.desa}
            disabled={desaDisabled}
            onOpen={loaders?.desa}
            ensureAllLoaded={loaders?.desa}
          />

          <SearchableSelect<SDOpt>
            label="Sumber Dana"
            placeholder="Semua Sumber Dana"
            value={selected.sumberdana}
            onChange={(v) => update('sumberdana', v)}
            options={filterData.sumberdana}
            getKey={(o) => o.Kode}
            getLabel={(o) => o.sumberdana}
            onOpen={loaders?.sumberdana}
            ensureAllLoaded={loaders?.sumberdana}
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100">Cancel</button>
          <button onClick={onClear} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100">Clear</button>
          <button onClick={onApply} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Terapkan Filter</button>
        </div>
      </div>
    </div>
  ) : null
}
