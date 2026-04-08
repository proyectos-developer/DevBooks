-- 1. Empresas (Tenants)
CREATE TABLE empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ruc CHAR(11) UNIQUE NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    nombre_comercial VARCHAR(255),
    direccion TEXT,
    estado_sunat VARCHAR(50), 
    certificado_digital_path TEXT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Usuarios (Vinculados a Empresa)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('ADMINISTRADOR', 'CONTADOR', 'CLIENTE') NOT NULL,
    primer_ingreso TINYINT(1) DEFAULT 1,
    estado TINYINT(1) DEFAULT 1,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id) ON DELETE CASCADE
);

-- 3. Periodos Contables
CREATE TABLE periodos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    anio INT NOT NULL,
    mes INT NOT NULL, -- 1 a 12
    cerrado TINYINT(1) DEFAULT 0,
    UNIQUE(id_empresa, anio, mes),
    CONSTRAINT fk_periodos_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id) ON DELETE CASCADE
);

-- 4. Plan Contable General Empresarial (PCGE)
CREATE TABLE plan_contable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    codigo VARCHAR(20) NOT NULL, 
    descripcion VARCHAR(255) NOT NULL,
    nivel INT NOT NULL, 
    tipo_cuenta VARCHAR(50), 
    permite_movimiento TINYINT(1) DEFAULT 1,
    UNIQUE(id_empresa, codigo),
    CONSTRAINT fk_plan_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id) ON DELETE CASCADE
);

-- 5. Tipos de Comprobantes (SUNAT Tabla 10)
CREATE TABLE tipos_comprobante (
    codigo CHAR(2) PRIMARY KEY, -- 01: Factura, 03: Boleta
    descripcion VARCHAR(100) NOT NULL
);

-- 6. Tipo de Cambio
CREATE TABLE tipo_cambio (
    fecha DATE PRIMARY KEY,
    compra DECIMAL(10,4) NOT NULL,
    venta DECIMAL(10,4) NOT NULL,
    fuente VARCHAR(20) DEFAULT 'SUNAT'
);

-- 7. Entidades (Clientes, Proveedores)
CREATE TABLE entidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    tipo_documento CHAR(1) NOT NULL, -- 1: DNI, 6: RUC
    numero_documento VARCHAR(15) NOT NULL,
    nombre_razon_social VARCHAR(255) NOT NULL,
    direccion TEXT,
    es_cliente TINYINT(1) DEFAULT 1,
    es_proveedor TINYINT(1) DEFAULT 0,
    UNIQUE(id_empresa, tipo_documento, numero_documento),
    CONSTRAINT fk_entidades_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id) ON DELETE CASCADE
);

-- 8. Cabecera del Asiento (Libro Diario)
CREATE TABLE asientos_cabecera (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    id_periodo INT NOT NULL,
    id_usuario INT NOT NULL, -- Quién lo registró
    fecha_asiento DATE NOT NULL,
    glosa TEXT NOT NULL,
    tipo_libro VARCHAR(10), -- Ventas, Compras, Diario
    moneda CHAR(3) DEFAULT 'PEN', 
    tipo_cambio DECIMAL(10,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cab_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id),
    CONSTRAINT fk_cab_periodo FOREIGN KEY (id_periodo) REFERENCES periodos(id),
    CONSTRAINT fk_cab_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- 9. Detalle del Asiento (Movimientos Partida Doble)
CREATE TABLE asientos_detalle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_asiento INT NOT NULL,
    id_cuenta INT NOT NULL,
    debe DECIMAL(14,2) DEFAULT 0.00,
    haber DECIMAL(14,2) DEFAULT 0.00,
    -- Datos para SIRE / Libros Electrónicos
    id_entidad INT,
    tipo_comprobante CHAR(2),
    serie_comprobante VARCHAR(10),
    numero_comprobante VARCHAR(20),
    fecha_emision_doc DATE,
    CONSTRAINT fk_det_asiento FOREIGN KEY (id_asiento) REFERENCES asientos_cabecera(id) ON DELETE CASCADE,
    CONSTRAINT fk_det_cuenta FOREIGN KEY (id_cuenta) REFERENCES plan_contable(id),
    CONSTRAINT fk_det_entidad FOREIGN KEY (id_entidad) REFERENCES entidades(id),
    CONSTRAINT fk_det_comprobante FOREIGN KEY (tipo_comprobante) REFERENCES tipos_comprobante(codigo)
);

-- 10. Cuentas Bancarias de la Empresa
CREATE TABLE cuentas_bancarias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    banco VARCHAR(100) NOT NULL, -- Ej: BCP, BBVA
    numero_cuenta VARCHAR(50) NOT NULL,
    moneda CHAR(3) DEFAULT 'PEN',
    id_cuenta_contable INT NOT NULL, -- FK a plan_contable (ej: cuenta 1041)
    CONSTRAINT fk_banco_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id),
    CONSTRAINT fk_banco_pcge FOREIGN KEY (id_cuenta_contable) REFERENCES plan_contable(id)
);

-- 11. Movimientos del Extracto Bancario (Para Conciliar)
CREATE TABLE banco_movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cuenta_bancaria INT NOT NULL,
    fecha_operacion DATE NOT NULL,
    descripcion_banco TEXT,
    referencia_operacion VARCHAR(50), -- Número de operación/operación
    monto DECIMAL(14,2) NOT NULL, -- Positivo (Ingreso), Negativo (Egreso)
    id_asiento_detalle INT DEFAULT NULL, -- FK a asientos_detalle cuando se concilia
    estado_conciliacion TINYINT(1) DEFAULT 0, -- 0: Pendiente, 1: Conciliado
    CONSTRAINT fk_mov_cuenta FOREIGN KEY (id_cuenta_bancaria) REFERENCES cuentas_bancarias(id),
    CONSTRAINT fk_mov_asiento FOREIGN KEY (id_asiento_detalle) REFERENCES asientos_detalle(id)
);

-- 12. Propuesta del SIRE (SUNAT) para Contrastar
CREATE TABLE sire_propuesta_ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    id_periodo INT NOT NULL,
    ruc_emisor CHAR(11),
    tipo_comprobante CHAR(2),
    serie VARCHAR(10),
    numero VARCHAR(20),
    fecha_emision DATE,
    monto_base DECIMAL(14,2),
    monto_igv DECIMAL(14,2),
    monto_total DECIMAL(14,2),
    estado_sire VARCHAR(50), -- 'ACEPTADO', 'REEMPLAZADO', 'PENDIENTE'
    id_asiento_detalle INT DEFAULT NULL, -- Relación con tu contabilidad local
    CONSTRAINT fk_sire_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id),
    CONSTRAINT fk_sire_periodo FOREIGN KEY (id_periodo) REFERENCES periodos(id),
    CONSTRAINT fk_sire_asiento FOREIGN KEY (id_asiento_detalle) REFERENCES asientos_detalle(id)
);

-- 13. Propuesta del SIRE Compras (SUNAT)
CREATE TABLE sire_propuesta_compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    id_periodo INT NOT NULL,
    ruc_proveedor CHAR(11),
    razon_social_proveedor VARCHAR(255),
    tipo_comprobante CHAR(2),
    serie VARCHAR(10),
    numero VARCHAR(20),
    fecha_emision DATE,
    monto_base_gravada DECIMAL(14,2), -- Base imponible
    monto_igv DECIMAL(14,2),
    monto_total DECIMAL(14,2),
    id_asiento_detalle INT DEFAULT NULL, -- Relación con tu contabilidad local (asientos_detalle)
    estado_sire ENUM('ACEPTADO', 'REEMPLAZADO', 'EXCLUIDO', 'PENDIENTE') DEFAULT 'PENDIENTE',
    CONSTRAINT fk_sire_compras_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id),
    CONSTRAINT fk_sire_compras_periodo FOREIGN KEY (id_periodo) REFERENCES periodos(id),
    CONSTRAINT fk_sire_compras_asiento FOREIGN KEY (id_asiento_detalle) REFERENCES asientos_detalle(id)
);