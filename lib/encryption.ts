// --- Konfigurasi Kunci ---
const userKey = process.env.ENCRYPT_USER_KEY ?? "";
const pwdKey = process.env.ENCRYPT_PWD_KEY ?? "";
const userKey2 = process.env.ENCRYPT_USER_KEY2 ?? "";
const pwdKey2 = process.env.ENCRYPT_PWD_KEY2 ?? "";
const serverKey = process.env.ENCRYPT_SERVER ?? "";
const dbKey = process.env.ENCRYPT_DB ?? "";

// --- Utilitas ---
function safeCharCode(str: string, i: number): number {
  return str.charCodeAt(i % str.length);
}

function joinAnsi(values: number[]): string {
  return values.join(',');
}

function splitAnsi(input: string): number[] {
  return input.split(',').map((v) => parseInt(v, 10));
}

function stripAnsiWrapper(input: string): string {
  const match = input.match(/^ANSI\[(.*)\]$/);
  return match ? match[1] : input;
}

// --- ENKRIPSI ---
function wrapAnsi(result: number[]): string {
  return `ANSI[${joinAnsi(result)}]`;
}

export function encryptUser(namaUser: string, jenis: number): string {
  const result: number[] = [];
  for (let i = 0; i < namaUser.length; i++) {
    const userAsli = namaUser.charCodeAt(i);
    const tmpJawab = safeCharCode(userKey, i);
    const tmpRumus = jenis === 1 ? userAsli + tmpJawab : userAsli - tmpJawab;
    result.push(tmpRumus);
  }
  return wrapAnsi(result);
}

export function encryptUser2(namaUser: string, jenis: number): string {
  const result: number[] = [];
  for (let i = 0; i < namaUser.length; i++) {
    const userAsli = namaUser.charCodeAt(i);
    const tmpJawab = safeCharCode(userKey2, i);
    const tmpRumus = jenis === 1 ? userAsli + tmpJawab : userAsli - tmpJawab;
    result.push(tmpRumus);
  }
  return wrapAnsi(result);
}

export function encryptPwd(mPassword: string, jenis: number): string {
  const result: number[] = [];
  for (let i = 0; i < mPassword.length; i++) {
    const passAsli = mPassword.charCodeAt(i);
    const tmpJawab = safeCharCode(pwdKey, i);
    const tmpRumus = jenis === 1 ? passAsli + tmpJawab : passAsli - tmpJawab;
    result.push(tmpRumus);
  }
  return wrapAnsi(result);
}

export function encryptPwd2(mPassword: string, jenis: number): string {
  const result: number[] = [];
  for (let i = 0; i < mPassword.length; i++) {
    const passAsli = mPassword.charCodeAt(i);
    const tmpJawab = safeCharCode(pwdKey2, i);
    const tmpRumus = jenis === 1 ? passAsli + tmpJawab : passAsli - tmpJawab;
    result.push(tmpRumus);
  }
  return wrapAnsi(result);
}

export function encryptLevel(mNamaUser: string, mLevel: string, jenis: number): string {
  const strLevel = mLevel.repeat(4);
  const result: number[] = [];
  for (let i = 0; i < mNamaUser.length; i++) {
    const userAsli = mNamaUser.charCodeAt(i);
    const tmpJawab = safeCharCode(strLevel, i);
    const tmpRumus = jenis === 1 ? userAsli + tmpJawab + 2 : userAsli - tmpJawab - 2;
    result.push(tmpRumus);
  }
  return wrapAnsi(result);
}

export function encryptKata(namaStr: string, acakStr: string, jenis: number): string {
  const result: number[] = [];
  for (let i = 0; i < namaStr.length; i++) {
    const kataAsli = namaStr.charCodeAt(i);
    const tmpJawab = safeCharCode(acakStr, i);
    const tmpRumus = jenis === 1 ? kataAsli + tmpJawab : kataAsli - tmpJawab;
    result.push(tmpRumus);
  }
  return wrapAnsi(result);
}

export function encryptServer(namaServer: string, jenis: number): string {
  const result: number[] = [];
  for (let i = 0; i < namaServer.length; i++) {
    const serverAsli = namaServer.charCodeAt(i);
    const tmpJawab = safeCharCode(serverKey, i);
    const tmpRumus = jenis === 1 ? serverAsli + tmpJawab : serverAsli - tmpJawab;
    result.push(tmpRumus);
  }
  return wrapAnsi(result);
}

export function encryptDB(namaDB: string, jenis: number): string {
  const result: number[] = [];
  for (let i = 0; i < namaDB.length; i++) {
    const dbAsli = namaDB.charCodeAt(i);
    const tmpJawab = safeCharCode(dbKey, i);
    const tmpRumus = jenis === 1 ? dbAsli + tmpJawab : dbAsli - tmpJawab;
    result.push(tmpRumus);
  }
  return wrapAnsi(result);
}

// --- DEKRIPSI ---
export function decryptUser(encrypted: string, jenis: number): string {
  const codes = splitAnsi(stripAnsiWrapper(encrypted));
  return codes.map((code, i) => {
    const tmpJawab = safeCharCode(userKey, i);
    const tmpRumus = jenis === 1 ? code - tmpJawab : code + tmpJawab;
    return String.fromCharCode(tmpRumus);
  }).join('');
}

export function decryptUser2(encrypted: string, jenis: number): string {
  const codes = splitAnsi(stripAnsiWrapper(encrypted));
  return codes.map((code, i) => {
    const tmpJawab = safeCharCode(userKey2, i);
    const tmpRumus = jenis === 1 ? code - tmpJawab : code + tmpJawab;
    return String.fromCharCode(tmpRumus);
  }).join('');
}

export function decryptPwd(encrypted: string, jenis: number): string {
  const codes = splitAnsi(stripAnsiWrapper(encrypted));
  return codes.map((code, i) => {
    const tmpJawab = safeCharCode(pwdKey, i);
    const tmpRumus = jenis === 1 ? code - tmpJawab : code + tmpJawab;
    return String.fromCharCode(tmpRumus);
  }).join('');
}

export function decryptPwd2(encrypted: string, jenis: number): string {
  const codes = splitAnsi(stripAnsiWrapper(encrypted));
  return codes.map((code, i) => {
    const tmpJawab = safeCharCode(pwdKey2, i);
    const tmpRumus = jenis === 1 ? code - tmpJawab : code + tmpJawab;
    return String.fromCharCode(tmpRumus);
  }).join('');
}

export function decryptLevel(encrypted: string, mLevel: string, jenis: number): string {
  const strLevel = mLevel.repeat(4);
  const codes = splitAnsi(stripAnsiWrapper(encrypted));
  return codes.map((code, i) => {
    const tmpJawab = safeCharCode(strLevel, i);
    const tmpRumus = jenis === 1 ? code - tmpJawab - 2 : code + tmpJawab + 2;
    return String.fromCharCode(tmpRumus);
  }).join('');
}

export function decryptKata(encrypted: string, acakStr: string, jenis: number): string {
  const codes = splitAnsi(stripAnsiWrapper(encrypted));
  return codes.map((code, i) => {
    const tmpJawab = safeCharCode(acakStr, i);
    const tmpRumus = jenis === 1 ? code - tmpJawab : code + tmpJawab;
    return String.fromCharCode(tmpRumus);
  }).join('');
}

export function decryptServer(encrypted: string, jenis: number): string {
  const codes = splitAnsi(stripAnsiWrapper(encrypted));
  return codes.map((code, i) => {
    const tmpJawab = safeCharCode(serverKey, i);
    const tmpRumus = jenis === 1 ? code - tmpJawab : code + tmpJawab;
    return String.fromCharCode(tmpRumus);
  }).join('');
}

export function decryptDB(encrypted: string, jenis: number): string {
  const codes = splitAnsi(stripAnsiWrapper(encrypted));
  return codes.map((code, i) => {
    const tmpJawab = safeCharCode(dbKey, i);
    const tmpRumus = jenis === 1 ? code - tmpJawab : code + tmpJawab;
    return String.fromCharCode(tmpRumus);
  }).join('');
}