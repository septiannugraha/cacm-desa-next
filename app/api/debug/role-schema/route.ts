import { NextRequest, NextResponse } from 'next/server'
import sql from 'mssql'

const dbConfig = {
  server: '31.220.73.89',
  port: 14317,
  database: 'Siswaskeudes_Baru',
  user: 'sa',
  password: '1',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
}

export async function GET(request: NextRequest) {
  try {
    await sql.connect(dbConfig)

    // Get CACM_Role table structure
    const schemaResult = await sql.query`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'CACM_Role'
      ORDER BY ORDINAL_POSITION
    `

    // Get sample data from CACM_Role
    const dataResult = await sql.query`
      SELECT TOP 2 *
      FROM CACM_Role
    `

    await sql.close()

    return NextResponse.json({
      success: true,
      schema: schemaResult.recordset,
      sampleData: dataResult.recordset,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error,
      },
      { status: 500 }
    )
  }
}
