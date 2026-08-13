-- Optional Seller WhatsApp confirmation template (#265)
ALTER TABLE "TenantConfig" ADD COLUMN IF NOT EXISTS "sellerWhatsappTemplate" VARCHAR(1024);
