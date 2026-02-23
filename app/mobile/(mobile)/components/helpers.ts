export function fmtDate(iso: string | null) {
    if (!iso) return '-'
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  
  export function fmtMoney(v: number | null) {
    if (v === null || v === undefined) return '-'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(v)
  }
  
  export function fmtNumber(v: number | null, digits = 2) {
    if (v === null || v === undefined) return '-'
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: digits }).format(v)
  }
  
  export function sum(nums: Array<number | null | undefined>): number {
    return nums.reduce<number>((acc, n) => acc + (typeof n === 'number' && !Number.isNaN(n) ? n : 0), 0)
  }
  