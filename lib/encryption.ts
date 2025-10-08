const userKey = process.env.ENCRYPT_USER_KEY ?? "";
const pwdKey = process.env.ENCRYPT_PWD_KEY ?? "";

const userKey2 = process.env.ENCRYPT_USER_KEY2 ?? "";
const pwdKey2 = process.env.ENCRYPT_PWD_KEY2 ?? "";


export function encryptUser(namaUser: string, jenis: number): string {
  let hasil = "";
  for (let i = 0; i < namaUser.length; i++) {
    const userAsli = namaUser.charCodeAt(i);
    const tmpJawab = userKey.charCodeAt(i);
    const tmpRumus = jenis === 1 ? userAsli + tmpJawab : userAsli - tmpJawab;
    hasil += String.fromCharCode(tmpRumus);
  }
  return hasil;
}


export function encryptUser2(namaUser: string, jenis: number): string {
    let hasil = "";
    for (let i = 0; i < namaUser.length; i++) {
      const userAsli = namaUser.charCodeAt(i);
      const tmpJawab = userKey2.charCodeAt(i);
      const tmpRumus = jenis === 1 ? userAsli + tmpJawab : userAsli - tmpJawab;
      hasil += String.fromCharCode(tmpRumus);
    }
    return hasil;
  }


export function encryptPwd(mPassword: string, jenis: number): string {
  let hasil = "";
  for (let i = 0; i < mPassword.length; i++) {
    const passAsli = mPassword.charCodeAt(i);
    const tmpJawab = pwdKey.charCodeAt(i);
    const tmpRumus = jenis === 1 ? passAsli + tmpJawab : passAsli - tmpJawab;
    hasil += String.fromCharCode(tmpRumus);
  }
  return hasil;
}


export function encryptPwd2(mPassword: string, jenis: number): string {
    let hasil = "";
    for (let i = 0; i < mPassword.length; i++) {
      const passAsli = mPassword.charCodeAt(i);
      const tmpJawab = pwdKey2.charCodeAt(i);
      const tmpRumus = jenis === 1 ? passAsli + tmpJawab : passAsli - tmpJawab;
      hasil += String.fromCharCode(tmpRumus);
    }
    return hasil;
  }
  

  export function encryptLevel(mNamaUser: string, mLevel: string, jenis: number): string {
    const strLevel = mLevel.repeat(4);
    let hasil = "";
  
    for (let i = 0; i < mNamaUser.length; i++) {
      const userAsli = mNamaUser.charCodeAt(i);
      const tmpJawab = strLevel.charCodeAt(i);
      const tmpRumus = jenis === 1 ? userAsli + tmpJawab + 2 : userAsli - tmpJawab - 2;
      hasil += String.fromCharCode(tmpRumus);
    }
  
    return hasil;
  }
  
  export function encryptKata(namaStr: string, acakStr: string, jenis: number): string {
    let hasil = "";
  
    for (let i = 0; i < namaStr.length; i++) {
      const kataAsli = namaStr.charCodeAt(i);
      const tmpJawab = acakStr.charCodeAt(i);
      const tmpRumus = jenis === 1 ? kataAsli + tmpJawab : kataAsli - tmpJawab;
      hasil += String.fromCharCode(tmpRumus);
    }
  
    return hasil;
  }