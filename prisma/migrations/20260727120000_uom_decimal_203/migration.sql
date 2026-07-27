-- Issue #203: unidades de medida, conversión de unidades de compra/venta y stock decimal.

-- AlterTable: Articulo — nuevas columnas de unidad de medida / conversión / logística (#203)
ALTER TABLE "Articulo" ADD COLUMN "unidadBase" VARCHAR(12) NOT NULL DEFAULT 'unidad';
ALTER TABLE "Articulo" ADD COLUMN "unidadCompra" VARCHAR(12);
ALTER TABLE "Articulo" ADD COLUMN "factorConversion" DECIMAL(14,6) NOT NULL DEFAULT 1;
ALTER TABLE "Articulo" ADD COLUMN "multiploVenta" DECIMAL(14,4);
ALTER TABLE "Articulo" ADD COLUMN "pesoKg" DECIMAL(14,4);
ALTER TABLE "Articulo" ADD COLUMN "volumenM3" DECIMAL(14,6);

-- AlterTable: Articulo — stock/minimo Int -> Decimal(14,4) (#203)
ALTER TABLE "Articulo" DROP CONSTRAINT IF EXISTS "Articulo_stock_nonneg_check";
ALTER TABLE "Articulo" DROP CONSTRAINT IF EXISTS "Articulo_minimo_nonneg_check";

ALTER TABLE "Articulo" ALTER COLUMN "stock" DROP DEFAULT;
ALTER TABLE "Articulo" ALTER COLUMN "stock" TYPE NUMERIC(14,4) USING "stock"::numeric(14,4);
ALTER TABLE "Articulo" ALTER COLUMN "stock" SET DEFAULT 0;

ALTER TABLE "Articulo" ALTER COLUMN "minimo" DROP DEFAULT;
ALTER TABLE "Articulo" ALTER COLUMN "minimo" TYPE NUMERIC(14,4) USING "minimo"::numeric(14,4);
ALTER TABLE "Articulo" ALTER COLUMN "minimo" SET DEFAULT 0;

ALTER TABLE "Articulo" ADD CONSTRAINT "Articulo_stock_nonneg_check" CHECK ("stock" >= 0);
ALTER TABLE "Articulo" ADD CONSTRAINT "Articulo_minimo_nonneg_check" CHECK ("minimo" >= 0);

-- AlterTable: StockDeposito — cantidad/stockMin/stockMax Int -> Decimal(14,4) (#203)
ALTER TABLE "StockDeposito" DROP CONSTRAINT IF EXISTS "StockDeposito_cantidad_nonneg_check";
ALTER TABLE "StockDeposito" DROP CONSTRAINT IF EXISTS "StockDeposito_stockMin_nonneg_check";

ALTER TABLE "StockDeposito" ALTER COLUMN "cantidad" DROP DEFAULT;
ALTER TABLE "StockDeposito" ALTER COLUMN "cantidad" TYPE NUMERIC(14,4) USING "cantidad"::numeric(14,4);
ALTER TABLE "StockDeposito" ALTER COLUMN "cantidad" SET DEFAULT 0;

ALTER TABLE "StockDeposito" ALTER COLUMN "stockMin" DROP DEFAULT;
ALTER TABLE "StockDeposito" ALTER COLUMN "stockMin" TYPE NUMERIC(14,4) USING "stockMin"::numeric(14,4);
ALTER TABLE "StockDeposito" ALTER COLUMN "stockMin" SET DEFAULT 0;

ALTER TABLE "StockDeposito" ALTER COLUMN "stockMax" TYPE NUMERIC(14,4) USING "stockMax"::numeric(14,4);

ALTER TABLE "StockDeposito" ADD CONSTRAINT "StockDeposito_cantidad_nonneg_check" CHECK ("cantidad" >= 0);
ALTER TABLE "StockDeposito" ADD CONSTRAINT "StockDeposito_stockMin_nonneg_check" CHECK ("stockMin" >= 0);

-- AlterTable: TransferenciaDepositoItem — cantidadEnviada/cantidadRecibida Int -> Decimal(14,4) (#203)
ALTER TABLE "TransferenciaDepositoItem" DROP CONSTRAINT IF EXISTS "TransferenciaDepositoItem_cantidadEnviada_pos_check";
ALTER TABLE "TransferenciaDepositoItem" DROP CONSTRAINT IF EXISTS "TransferenciaDepositoItem_cantidadRecibida_nonneg_check";

ALTER TABLE "TransferenciaDepositoItem" ALTER COLUMN "cantidadEnviada" TYPE NUMERIC(14,4) USING "cantidadEnviada"::numeric(14,4);
ALTER TABLE "TransferenciaDepositoItem" ALTER COLUMN "cantidadRecibida" TYPE NUMERIC(14,4) USING "cantidadRecibida"::numeric(14,4);

ALTER TABLE "TransferenciaDepositoItem" ADD CONSTRAINT "TransferenciaDepositoItem_cantidadEnviada_pos_check" CHECK ("cantidadEnviada" > 0);
ALTER TABLE "TransferenciaDepositoItem" ADD CONSTRAINT "TransferenciaDepositoItem_cantidadRecibida_nonneg_check" CHECK ("cantidadRecibida" IS NULL OR "cantidadRecibida" >= 0);

-- AlterTable: OrdenCompraItem — cantidad/cantidadRecibida Int -> Decimal(14,4) (#203)
ALTER TABLE "OrdenCompraItem" ALTER COLUMN "cantidad" TYPE NUMERIC(14,4) USING "cantidad"::numeric(14,4);
ALTER TABLE "OrdenCompraItem" ALTER COLUMN "cantidadRecibida" DROP DEFAULT;
ALTER TABLE "OrdenCompraItem" ALTER COLUMN "cantidadRecibida" TYPE NUMERIC(14,4) USING "cantidadRecibida"::numeric(14,4);
ALTER TABLE "OrdenCompraItem" ALTER COLUMN "cantidadRecibida" SET DEFAULT 0;

-- AlterTable: RecuentoItem — cantSistema/cantFisica Int -> Decimal(14,4) (#203)
ALTER TABLE "RecuentoItem" ALTER COLUMN "cantSistema" TYPE NUMERIC(14,4) USING "cantSistema"::numeric(14,4);
ALTER TABLE "RecuentoItem" ALTER COLUMN "cantFisica" TYPE NUMERIC(14,4) USING "cantFisica"::numeric(14,4);

-- AlterTable: PedidoItem — cantidad Int -> Decimal(14,4) (#203)
ALTER TABLE "PedidoItem" ALTER COLUMN "cantidad" DROP DEFAULT;
ALTER TABLE "PedidoItem" ALTER COLUMN "cantidad" TYPE NUMERIC(14,4) USING "cantidad"::numeric(14,4);
ALTER TABLE "PedidoItem" ALTER COLUMN "cantidad" SET DEFAULT 1;

-- AlterTable: FacturaItem — cantidad Int -> Decimal(14,4); snapshots de unidad de medida (#203)
ALTER TABLE "FacturaItem" ALTER COLUMN "cantidad" DROP DEFAULT;
ALTER TABLE "FacturaItem" ALTER COLUMN "cantidad" TYPE NUMERIC(14,4) USING "cantidad"::numeric(14,4);
ALTER TABLE "FacturaItem" ALTER COLUMN "cantidad" SET DEFAULT 1;
ALTER TABLE "FacturaItem" ADD COLUMN "unidadMedida" VARCHAR(12);
ALTER TABLE "FacturaItem" ADD COLUMN "codigoAfipUnidad" VARCHAR(2);

-- AlterTable: RemitoItem — cantidad Int -> Decimal(14,4) (#203)
ALTER TABLE "RemitoItem" ALTER COLUMN "cantidad" DROP DEFAULT;
ALTER TABLE "RemitoItem" ALTER COLUMN "cantidad" TYPE NUMERIC(14,4) USING "cantidad"::numeric(14,4);
ALTER TABLE "RemitoItem" ALTER COLUMN "cantidad" SET DEFAULT 1;

-- AlterTable: ContratoItem — cantidad Int -> Decimal(14,4) (#203)
ALTER TABLE "ContratoItem" ALTER COLUMN "cantidad" DROP DEFAULT;
ALTER TABLE "ContratoItem" ALTER COLUMN "cantidad" TYPE NUMERIC(14,4) USING "cantidad"::numeric(14,4);
ALTER TABLE "ContratoItem" ALTER COLUMN "cantidad" SET DEFAULT 1;

-- AlterTable: Lote — stockInicial/stockActual Int -> Decimal(14,4) (#203)
ALTER TABLE "Lote" ALTER COLUMN "stockInicial" TYPE NUMERIC(14,4) USING "stockInicial"::numeric(14,4);
ALTER TABLE "Lote" ALTER COLUMN "stockActual" TYPE NUMERIC(14,4) USING "stockActual"::numeric(14,4);

-- AlterTable: StockAjuste — cantidad Int -> Decimal(14,4) (#203)
ALTER TABLE "StockAjuste" ALTER COLUMN "cantidad" TYPE NUMERIC(14,4) USING "cantidad"::numeric(14,4);
