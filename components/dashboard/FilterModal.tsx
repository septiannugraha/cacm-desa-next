'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { FiSearch, FiX, FiChevronDown } from 'react-icons/fi'

type ProvOpt = { provinsi: string; Kd_Prov: string }
type PemdaOpt = { namapemda: string; Kd_Pemda: string }
type KecOpt = { kecamatan: string; Kd_Kec: string }
type DesaOpt = { desa: string; Kd_Desa: string }
type SDOpt = { sumberdana: string; Kode: string }

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

/* =========================================================
   Reusable Searchable Select
========================================================= */

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
  ensureAllLoaded,
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
    return options.filter((o) =>
      getLabel(o).toLowerCase().includes(q)
    )
  }, [options, query, getLabel])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node))
        setOpen(false)
    }
    window.addEventListener('click', handleClickOutside)
    return () =>
      window.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open) onOpen?.()
  }, [open, onOpen])

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((s) => !s)}
        className={`w-full border px-3 py-2 rounded-lg flex items-center justify-between ${
          disabled
            ? 'bg-gray-100 text-gray-400'
            : 'bg-white'
        }`}
      >
        <span
          className={`truncate ${
            !value ? 'text-gray-400' : ''
          }`}
        >
          {value
            ? getLabel(
                options.find((o) => getKey(o) === value) as T
              ) || ''
            : placeholder}
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
                if ((options?.length ?? 0) < 10)
                  ensureAllLoaded?.()
              }}
              placeholder={`Cari ${label.toLowerCase()}...`}
              className="w-full outline-none py-1"
            />
            {query && (
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setQuery('')}
              >
                <FiX />
              </button>
            )}
          </div>

          <ul className="divide-y">
            <li
              className="px-3 py-2 cursor-pointer hover:bg-gray-50"
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

              return (
                <li
                  key={k}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    onChange(k)
                    setOpen(false)
                  }}
                >
                  {lbl}
                </li>
              )
            })}

            {!filtered.length && (
              <li className="px-3 py-2 text-gray-500 text-sm">
                Tidak ada hasil
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

/* =========================================================
   Filter Modal (SAFE VERSION)
========================================================= */

export default function FilterModal({
  show,
  onClose,
  filterData = {
    provinsi: [],
    pemda: [],
    kecamatan: [],
    desa: [],
    sumberdana: [],
  },
  selected = {
    provinsi: '',
    pemda: '',
    kecamatan: '',
    desa: '',
    sumberdana: '',
  },
  setSelected = () => {},
  onApply = () => {},
  onClear = () => {},
  loaders = {},
}: {
  show: boolean
  onClose: () => void
  filterData?: FilterDataProps
  selected?: SelectedProps
  setSelected?: (next: SelectedProps) => void
  onApply?: () => void
  onClear?: () => void
  loaders?: Loaders
}) {
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if ((e.target as HTMLElement).id === 'modal-overlay')
        onClose()
    }
    window.addEventListener('click', handleOutside)
    return () =>
      window.removeEventListener('click', handleOutside)
  }, [onClose])

  const update = (
    key: keyof SelectedProps,
    value: string
  ) => {
    const next: SelectedProps = {
      provinsi: selected?.provinsi || '',
      pemda: selected?.pemda || '',
      kecamatan: selected?.kecamatan || '',
      desa: selected?.desa || '',
      sumberdana: selected?.sumberdana || '',
      [key]: value,
    }

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

  const pemdaDisabled = !selected?.provinsi
  const kecDisabled = !selected?.pemda
  const desaDisabled = !selected?.kecamatan

  if (!show) return null

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30"
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Filter Data
          </h3>
          <button onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <SearchableSelect
            label="Provinsi"
            placeholder="Semua Provinsi"
            value={selected.provinsi}
            onChange={(v) => update('provinsi', v)}
            options={filterData.provinsi}
            getKey={(o) => o.Kd_Prov}
            getLabel={(o) => o.provinsi}
            onOpen={loaders.provinsi}
            ensureAllLoaded={loaders.provinsi}
          />

          <SearchableSelect
            label="Pemda"
            placeholder="Semua Pemda"
            value={selected.pemda}
            onChange={(v) => update('pemda', v)}
            options={filterData.pemda}
            getKey={(o) => o.Kd_Pemda}
            getLabel={(o) => o.namapemda}
            disabled={pemdaDisabled}
            onOpen={loaders.pemda}
            ensureAllLoaded={loaders.pemda}
          />

          <SearchableSelect
            label="Kecamatan"
            placeholder="Semua Kecamatan"
            value={selected.kecamatan}
            onChange={(v) => update('kecamatan', v)}
            options={filterData.kecamatan}
            getKey={(o) => o.Kd_Kec}
            getLabel={(o) => o.kecamatan}
            disabled={kecDisabled}
            onOpen={loaders.kecamatan}
            ensureAllLoaded={loaders.kecamatan}
          />

          <SearchableSelect
            label="Desa"
            placeholder="Semua Desa"
            value={selected.desa}
            onChange={(v) => update('desa', v)}
            options={filterData.desa}
            getKey={(o) => o.Kd_Desa}
            getLabel={(o) => o.desa}
            disabled={desaDisabled}
            onOpen={loaders.desa}
            ensureAllLoaded={loaders.desa}
          />

          <SearchableSelect
            label="Sumber Dana"
            placeholder="Semua Sumber Dana"
            value={selected.sumberdana}
            onChange={(v) => update('sumberdana', v)}
            options={filterData.sumberdana}
            getKey={(o) => o.Kode}
            getLabel={(o) => o.sumberdana}
            onOpen={loaders.sumberdana}
            ensureAllLoaded={loaders.sumberdana}
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onClear}
            className="px-4 py-2 border rounded-lg"
          >
            Clear
          </button>
          <button
            onClick={onApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>
  )
}