-- Migration Script to align with CACMDesaV2 data structure
-- Run this to update existing database or create new tables

-- =====================================================
-- 1. Add new columns to existing tables
-- =====================================================

-- Update Pemda table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Pemda') AND name = 'kdPemda')
BEGIN
    ALTER TABLE Pemda ADD kdPemda NVARCHAR(50);
    CREATE UNIQUE INDEX IX_Pemda_kdPemda ON Pemda(kdPemda) WHERE kdPemda IS NOT NULL;
END
GO

-- Update Village table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Village') AND name = 'kdDesa')
BEGIN
    ALTER TABLE Village ADD kdDesa NVARCHAR(50);
    ALTER TABLE Village ADD kdKec NVARCHAR(50);
    ALTER TABLE Village ADD hpKades NVARCHAR(20);
    ALTER TABLE Village ADD alamat NVARCHAR(255);
    ALTER TABLE Village ADD ibukota NVARCHAR(100);
    CREATE UNIQUE INDEX IX_Village_kdDesa ON Village(kdDesa) WHERE kdDesa IS NOT NULL;
END
GO

-- Update Atensi table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Atensi') AND name = 'noAtensi')
BEGIN
    ALTER TABLE Atensi ADD noAtensi NVARCHAR(50);
    ALTER TABLE Atensi ADD tglAtensi DATETIME;
    ALTER TABLE Atensi ADD jlhRF INT DEFAULT 0;
    ALTER TABLE Atensi ADD jlhTL INT DEFAULT 0;
    ALTER TABLE Atensi ADD isSent BIT DEFAULT 0;
    ALTER TABLE Atensi ADD keterangan NVARCHAR(MAX);
    ALTER TABLE Atensi ADD updateBy NVARCHAR(450);
    ALTER TABLE Atensi ADD updateAt DATETIME;
    CREATE INDEX IX_Atensi_noAtensi ON Atensi(noAtensi) WHERE noAtensi IS NOT NULL;
END
GO

-- Update AtensiCategory table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AtensiCategory') AND name = 'jnsAtensi')
BEGIN
    ALTER TABLE AtensiCategory ADD jnsAtensi INT;
    ALTER TABLE AtensiCategory ADD singkatan NVARCHAR(20);
    ALTER TABLE AtensiCategory ADD tipe NVARCHAR(50);
    ALTER TABLE AtensiCategory ADD kriteriaJns NVARCHAR(50);
    ALTER TABLE AtensiCategory ADD kriteriaNilai FLOAT;
    ALTER TABLE AtensiCategory ADD satuan NVARCHAR(20);
    ALTER TABLE AtensiCategory ADD syntax NVARCHAR(MAX);
    ALTER TABLE AtensiCategory ADD stdCaption NVARCHAR(50);
    ALTER TABLE AtensiCategory ADD realCaption NVARCHAR(50);
    ALTER TABLE AtensiCategory ADD difCaption NVARCHAR(50);
    CREATE INDEX IX_AtensiCategory_jnsAtensi ON AtensiCategory(jnsAtensi) WHERE jnsAtensi IS NOT NULL;
END
GO

-- =====================================================
-- 2. Create new tables
-- =====================================================

-- Create StatusTL table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('StatusTL') AND type = 'U')
BEGIN
    CREATE TABLE StatusTL (
        statusTL INT NOT NULL PRIMARY KEY,
        keterangan NVARCHAR(255) NOT NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE()
    );
    
    -- Insert default status values
    INSERT INTO StatusTL (statusTL, keterangan) VALUES
    (1, 'Belum Ditindaklanjuti'),
    (2, 'Sedang Diproses'),
    (3, 'Perlu Klarifikasi'),
    (4, 'Menunggu Dokumen'),
    (5, 'Dalam Perbaikan'),
    (6, 'Selesai Sebagian'),
    (7, 'Selesai'),
    (8, 'Ditolak'),
    (9, 'Dibatalkan');
END
GO

-- Create StatusVerifikasi table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('StatusVerifikasi') AND type = 'U')
BEGIN
    CREATE TABLE StatusVerifikasi (
        statusVer INT NOT NULL PRIMARY KEY,
        keterangan NVARCHAR(255) NOT NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE()
    );
    
    -- Insert default verification status values
    INSERT INTO StatusVerifikasi (statusVer, keterangan) VALUES
    (1, 'Belum Diverifikasi'),
    (2, 'Sedang Diverifikasi'),
    (3, 'Terverifikasi'),
    (4, 'Perlu Perbaikan'),
    (5, 'Ditolak');
END
GO

-- Create AtensiDesa table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('AtensiDesa') AND type = 'U')
BEGIN
    CREATE TABLE AtensiDesa (
        id NVARCHAR(450) NOT NULL PRIMARY KEY DEFAULT NEWID(),
        idAtensiDesa NVARCHAR(100) NOT NULL UNIQUE,
        tahun INT NOT NULL,
        kdPemda NVARCHAR(50) NOT NULL,
        kdDesa NVARCHAR(50) NOT NULL,
        noAtensi NVARCHAR(50),
        atensiId NVARCHAR(450),
        jlhRF INT DEFAULT 0,
        jlhTL INT DEFAULT 0,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        
        -- Indexes
        CONSTRAINT UQ_AtensiDesa_Composite UNIQUE(tahun, kdPemda, kdDesa, noAtensi),
        CONSTRAINT FK_AtensiDesa_Atensi FOREIGN KEY (atensiId) REFERENCES Atensi(id),
        CONSTRAINT FK_AtensiDesa_Village FOREIGN KEY (kdDesa) REFERENCES Village(kdDesa),
        CONSTRAINT FK_AtensiDesa_Pemda FOREIGN KEY (kdPemda) REFERENCES Pemda(kdPemda)
    );
    
    CREATE INDEX IX_AtensiDesa_idAtensiDesa ON AtensiDesa(idAtensiDesa);
    CREATE INDEX IX_AtensiDesa_tahun ON AtensiDesa(tahun);
    CREATE INDEX IX_AtensiDesa_kdPemda ON AtensiDesa(kdPemda);
    CREATE INDEX IX_AtensiDesa_kdDesa ON AtensiDesa(kdDesa);
END
GO

-- Create AtensiDesaRinc table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('AtensiDesaRinc') AND type = 'U')
BEGIN
    CREATE TABLE AtensiDesaRinc (
        id NVARCHAR(450) NOT NULL PRIMARY KEY DEFAULT NEWID(),
        idAtensiDesa NVARCHAR(100) NOT NULL,
        tahun INT NOT NULL,
        kdPemda NVARCHAR(50) NOT NULL,
        kdDesa NVARCHAR(50) NOT NULL,
        noAtensi NVARCHAR(50),
        jnsAtensi NVARCHAR(450) NOT NULL,
        noBukti NVARCHAR(100) NOT NULL,
        tglBukti DATETIME2 NOT NULL,
        ketBukti NVARCHAR(MAX),
        nilai FLOAT,
        satuan NVARCHAR(20),
        statusTL INT,
        statusVer INT,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        
        -- Foreign Keys
        CONSTRAINT FK_AtensiDesaRinc_AtensiDesa FOREIGN KEY (idAtensiDesa) REFERENCES AtensiDesa(idAtensiDesa),
        CONSTRAINT FK_AtensiDesaRinc_Category FOREIGN KEY (jnsAtensi) REFERENCES AtensiCategory(code),
        CONSTRAINT FK_AtensiDesaRinc_StatusTL FOREIGN KEY (statusTL) REFERENCES StatusTL(statusTL),
        CONSTRAINT FK_AtensiDesaRinc_StatusVer FOREIGN KEY (statusVer) REFERENCES StatusVerifikasi(statusVer)
    );
    
    CREATE INDEX IX_AtensiDesaRinc_idAtensiDesa ON AtensiDesaRinc(idAtensiDesa);
    CREATE INDEX IX_AtensiDesaRinc_noBukti ON AtensiDesaRinc(noBukti);
    CREATE INDEX IX_AtensiDesaRinc_tahun ON AtensiDesaRinc(tahun);
END
GO

-- =====================================================
-- 3. Create compatibility views (optional)
-- =====================================================

-- Create view to match original CACM_Atensi structure
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID('CACM_Atensi'))
    DROP VIEW CACM_Atensi;
GO

CREATE VIEW CACM_Atensi AS
SELECT 
    a.id,
    a.fiscalYear as Tahun,
    p.kdPemda as Kd_Pemda,
    a.noAtensi as No_Atensi,
    a.tglAtensi as Tgl_Atensi,
    a.keterangan as Keterangan,
    a.jlhRF as Jlh_RF,
    a.jlhTL as Jlh_TL,
    a.isSent,
    a.updateBy as update_by,
    a.updateAt as update_at,
    a.createdAt as created_at
FROM Atensi a
INNER JOIN Pemda p ON a.pemdaId = p.id;
GO

-- Create view to match original CACM_Atensi_Desa structure
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID('CACM_Atensi_Desa'))
    DROP VIEW CACM_Atensi_Desa;
GO

CREATE VIEW CACM_Atensi_Desa AS
SELECT 
    ad.id,
    ad.idAtensiDesa as Id_Atensi_Desa,
    ad.tahun as Tahun,
    ad.kdPemda as Kd_Pemda,
    ad.kdDesa as Kd_Desa,
    ad.noAtensi as No_Atensi,
    ad.jlhRF as Jlh_RF,
    ad.jlhTL as Jlh_TL,
    ad.createdAt as created_at,
    ad.updatedAt as updated_at
FROM AtensiDesa ad;
GO

-- Create view to match original CACM_Atensi_Desa_Rinc structure
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID('CACM_Atensi_Desa_Rinc'))
    DROP VIEW CACM_Atensi_Desa_Rinc;
GO

CREATE VIEW CACM_Atensi_Desa_Rinc AS
SELECT 
    adr.id,
    adr.idAtensiDesa as Id_Atensi_Desa,
    adr.tahun as Tahun,
    adr.kdPemda as Kd_Pemda,
    adr.kdDesa as Kd_Desa,
    adr.noAtensi as No_Atensi,
    ac.jnsAtensi as Jns_Atensi,
    adr.noBukti as No_Bukti,
    adr.tglBukti as Tgl_Bukti,
    adr.ketBukti as Ket_Bukti,
    adr.nilai as Nilai,
    adr.satuan as Satuan,
    adr.statusTL as StatusTL,
    adr.statusVer as StatusVer,
    adr.createdAt as created_at
FROM AtensiDesaRinc adr
INNER JOIN AtensiCategory ac ON adr.jnsAtensi = ac.code;
GO

-- Create view to match original CACM_Jns_Atensi structure
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID('CACM_Jns_Atensi'))
    DROP VIEW CACM_Jns_Atensi;
GO

CREATE VIEW CACM_Jns_Atensi AS
SELECT 
    jnsAtensi as Jns_Atensi,
    name as Nama_Atensi,
    singkatan as Singkatan,
    tipe as Tipe,
    kriteriaJns as Kriteria_Jns,
    kriteriaNilai as Kriteria_Nilai,
    satuan as Satuan,
    syntax as Syntax,
    stdCaption as Std_Caption,
    realCaption as Real_Caption,
    difCaption as Dif_Caption
FROM AtensiCategory
WHERE active = 1;
GO

-- Create view to match original Ref_Desa structure
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID('Ref_Desa'))
    DROP VIEW Ref_Desa;
GO

CREATE VIEW Ref_Desa AS
SELECT 
    kdDesa as Kd_Desa,
    name as Nama_Desa,
    kdKec as Kd_Kec,
    alamat as Alamat,
    ibukota as Ibukota
FROM Village;
GO

-- Create view to match original CACM_StatusTL structure
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID('CACM_StatusTL'))
    DROP VIEW CACM_StatusTL;
GO

CREATE VIEW CACM_StatusTL AS
SELECT 
    statusTL as StatusTL,
    keterangan as Keterangan
FROM StatusTL;
GO

PRINT 'Migration completed successfully!';
PRINT 'New tables created: StatusTL, StatusVerifikasi, AtensiDesa, AtensiDesaRinc';
PRINT 'Compatibility views created for legacy queries';
GO