# Manual do usuário: Finanças

## Acesso

Clique em **Finanças** na barra lateral.

É necessário o permissão **`reports.financial.read`**. Sem ela, a página exibe mensagem de acesso negado.

## Aging de contas a receber

Ao carregar, a página consulta **`GET /api/reportes/aging`** e mostra faixas (rótulos, quantidade de faturas, totais). É possível ordenar por colunas quando a UI implementar.

## Extrato do cliente

### Ficha do cliente (`finance.ledger`, #232)

Com o módulo **`finance.ledger`** habilitado, a ficha de cada cliente inclui a aba **Conta corrente**:

- Saldo atual, limite de crédito e gráfico de evolução.
- Tabela de movimentos paginada (fatura, nota de crédito, recebimento, retenção, cheque devolvido, ajuste).
- Aging por faixas (`0-30`, `31-60`, `61-90`, `+90` dias).
- Ajuste manual auditado (`POST /api/clientes/{id}/cuenta-corriente/ajuste`, permissão `sales.create`).
- Download de extrato em PDF e envio por e-mail (`GET` / `POST .../estado-de-cuenta/...`).

API canônica: `GET /api/clientes/{id}/cuenta-corriente`, `.../saldo`, `.../antiguedad`.

Os movimentos são registrados automaticamente ao emitir faturas, anular com nota de crédito, registrar recebimentos (valor bruto; retenções não geram linha separada no razão) e rejeitar cheques vinculados a recebimentos.

### Consulta rápida em Finanças (compatibilidade)

1. Informe o **id do cliente** (inteiro positivo).
2. Execute a ação para carregar o extrato (`GET /api/reportes/cuenta-corriente/:clienteId` — delega ao ledger e mantém o formato legado débito/crédito).
3. Revise as linhas com data, tipo, referência, débito, crédito e saldo acumulado.

Se o cliente não existir, a API retorna 404.

## Faturas vencidas e lembretes

A mesma página **Finanças** inclui uma seção de faturas vencidas (`GET /api/cobranzas/vencidas`):

1. Opcionalmente filtre por **dias mínimos em atraso**.
2. Revise a tabela (cliente, total, data, dias em atraso).
3. Use **Enviar lembrete** em uma linha para acionar `POST /api/cobranzas/recordatorios` (permissão `reports.financial.read`). Não é enviado mais de um lembrete por fatura no mesmo dia.

A configuração do job automático (dias de carência, fuso IANA, horário comercial) está em **Configurações → Empresa**. O job operacional `npm run cobranzas:recordatorios` percorre todos os tenants com parâmetros de empresa e envia às **08:00 horário local** dentro da janela configurada (veja [ciclo CI/CD](../quality/ciclo-ci-cd.md)).

## Credenciais Mercado Pago (#174)

Quando o tenant tem a integração **`mercadopago`** habilitada (config do superadmin), configure as credenciais em **Configurações → Empresa** (seção *MercadoPago*):

- **Access Token**, **Public Key** e **Webhook Secret** opcional (segredos criptografados em repouso; não são exibidos após salvar).
- Interruptores **Modo sandbox** e **Integração ativa**.
- **Verificar credenciais** chama `POST /api/configuracion/mercadopago/test` e mostra o nome da conta MP.

Requer **`settings.business.manage`**.

## OAuth Mercado Livre (#183)

Conexão base do conector marketplace Mercado Livre. Habilite a integração **`meli`** do tenant (super-admin) e abra **Configurações → Empresa → Mercado Livre**:

1. **Conectar com Mercado Livre** — o BizCode devolve a URL de autorização (`GET /api/oauth/meli/authorize`) e o navegador redireciona para o ML.
2. Após autorizar, o ML chama `GET /api/oauth/meli/callback` (público). O BizCode valida o `state` CSRF assinado, troca o `code` por tokens, cifra em `MeliConfig` (mesma chave AES-GCM dos segredos fiscais/MP) e redireciona para `/configuracion?meli=connected`.
3. O status (`GET /api/configuracion/meli`) mostra nickname, site (`MLA`/`MLM`/…), data de conexão e last4 do token — **nunca** access nem refresh tokens.
4. **Desconectar** (`POST /api/oauth/meli/disconnect`) tenta revogar o app no ML e apaga tokens locais.
5. Env da plataforma: `MELI_CLIENT_ID`, `MELI_CLIENT_SECRET`, opcional `MELI_REDIRECT_URI` (padrão `{API_PUBLIC_URL}/api/oauth/meli/callback`). Agendar `npm run meli:token-refresh` a cada 5 horas (access tokens expiram ~6 h).

Em local, o smoke OAuth pode exigir um túnel público para o ML alcançar o callback.

## Sync de catálogo Mercado Livre (#184)

Com OAuth conectado, o vendedor pode optar por artigo em **Artigos → editar → Mercado Livre**:

1. Adicionar pelo menos uma foto (o ML exige; o BizCode envia URLs absolutas com `API_PUBLIC_URL` + `/uploads/articulos/...`).
2. Buscar categoria ML (`GET /api/meli/categories/search?q=`) e publicar (`PUT /api/articulos/{id}/meli`). Grava `MeliPublicacion` e chama ML `POST /items` (ou `PUT /items/{id}` se já vinculado).
3. Mudanças posteriores de preço/descrição/ativo são enviadas ao ML imediatamente; linhas `pending`/`error` são retentadas com `npm run meli:catalog-sync` a cada 5 minutos.
4. **Desvincular** (`DELETE /api/articulos/{id}/meli`) pausa o anúncio remoto quando possível e apaga o mapeamento local.

## Sync de estoque Mercado Livre (#185)

Sync bidirecional de estoque para artigos com `MeliPublicacion` vinculada (`meliItemId`):

1. **BizCode → ML:** após o decremento de estoque na fatura (`FacturaService`) ou qualquer `StockAjuste` (manual, recebimento de compra, contagem, produção, etc.), `MeliStockSyncService` atualiza apenas `{ available_quantity }` no ML. Estoque ≤ 0 pausa o anúncio (`status: paused`); estoque &gt; 0 e artigo ativo o reativa.
2. **ML → BizCode:** registrar notificações MeLi em `POST /api/webhooks/meli` (público). O env da plataforma `MELI_WEBHOOK_SECRET` valida `x-signature` (HMAC-SHA256). O topic `orders_v2` reconsulta o pedido em `MeliOrden` (#186): em `paid`, aplica `StockAjuste` `venta_meli` uma vez e cria Pedido `confirmed` com `origen=meli` (preços ML); em `cancelled`, cancela o Pedido se não estiver faturado e restaura estoque (`cancelacion_meli`); se já estiver faturado, alerta managers (sem NC automática). Topics `items` / `item_price` alertam managers se o preço ML divergir (sem auto-corrigir).
3. **Reconciliação:** agendar `npm run meli:stock-reconcile` a cada hora — o estoque do BizCode é a fonte da verdade; diferenças são corrigidas empurrando ao ML sem duplicar movimentos.
4. Auditoria: `MeliWebhookEvent` registra notificações; o duplicado `(topic, resource)` **não** bloqueia transições de status do pedido.

## Importação de pedidos Mercado Livre (#186)

Vendas pagas do Mercado Livre viram Pedidos para faturar sem duplo desconto de estoque:

1. Abrir **Pedidos → Pedidos ML** (módulo `billing.orders` e integração `meli`).
2. Filtrar por pendente / faturada / cancelada; ML Full é marcado como sem envio próprio (#193 tracking fora de escopo).
3. **Faturar** chama `POST /api/meli/ordenes/{meliOrderId}/facturar` — fatura A sem CUIT do cliente retorna `422` `CUIT_REQUIRED_FOR_FACTURA_A`. Completar o CUIT no cliente limpa o pendente.
4. A fatura de pedidos `origen=meli` usa `skipStockDecrement` porque o estoque já moveu no webhook.

## Motor compartilhado de sync eCommerce (#189)

Pushes de catálogo e estoque dos conectores marketplace passam por uma fila Prisma compartilhada (`EcommerceSyncJob`) com histórico SyncLog:

1. **Configurações → Empresa → Integrações eCommerce** lista os conectores conhecidos (`meli`, `tiendanube`, `woocommerce`) e as últimas linhas SyncLog (filtro por conector/status). Exige `settings.business.manage`.
2. Catálogo/estoque MeLi enfileiram jobs processados na request e por `npm run ecommerce:sync-worker` a cada minuto (retries 1m/5m/30m; após 3 falhas DLQ e alerta a `super_admin` da plataforma).
3. APIs: `GET /api/ecommerce/connectors`, `GET /api/ecommerce/sync-logs`. Tiendanube e WooCommerce ficam `not_configured` até #187/#188.

Artigos pai e serviços não são publicados.

## Links de pagamento Mercado Pago (#175)

Com Mercado Pago configurado (#174) e ativo, a equipe pode gerar um **link de pagamento** no detalhe da fatura (**Cobrar com Mercado Pago**):

1. Abrir uma fatura ativa com saldo pendente.
2. Gerar o link (`POST /api/facturas/{id}/mp/preference`) — uma preference ativa por fatura (72 horas).
3. Copiar o link ou compartilhar por WhatsApp / e-mail (telefone e e-mail do cliente).

Clientes do portal veem **Pagar online** quando existe um link ativo para a fatura.

Defina **`API_PUBLIC_URL`** em produção para o Mercado Pago alcançar a URL de webhook registrada em cada preference.

## Webhook de pagamento Mercado Pago (#176)

O Mercado Pago envia notificações para `POST /api/webhooks/mercadopago` (público, sem sessão). Requisitos:

1. Configurar **`webhookSecret`** em **Configurações → Empresa** (mesmo segredo da aplicação Mercado Pago).
2. Definir **`API_PUBLIC_URL`** com a URL pública da API.
3. Quando o cliente paga um link de fatura (#175), o BizCode valida a assinatura, consulta o pagamento no Mercado Pago e, se **approved**, cria um **recibo de cobrança** (`ReciboCobro`) com forma `mercadopago` imputado na fatura; `Factura.mpEstado` passa a `approved`.
4. Notificações duplicadas do mesmo `mpPaymentId` são ignoradas (idempotente).
5. Managers recebem notificação in-app ao receber ou falhar um pagamento.

## QR de cobrança presencial Mercado Pago (#177)

Para cobrança no balcão (web) com Mercado Pago configurado (#174) e ativo:

1. Abrir uma fatura ativa com saldo pendente.
2. Escolher **Cobrar com QR** — gera um QR dinâmico instore (`POST /api/facturas/{id}/mp/qr`, TTL 10 minutos).
3. Exibir o QR para o cliente escanear com o app Mercado Pago; a UI consulta `GET /api/facturas/{id}/mp` a cada 3 segundos até `approved`.
4. A confirmação usa o mesmo webhook do #176 (`external_reference` = `{tenantId}:{facturaId}`).
5. Opcional em **Configurações → Empresa**: **ID do POS** (`externalPosId`) e **payload QR estático** (`staticQrData`); staff com `settings.business.manage` pode ler o QR estático via `GET /api/configuracion/mercadopago/qr-estatico`.

A extensão no App Repartidor fica para o issue #162 (cobranças na entrega).

## Reconciliação de pagamentos Mercado Pago (#178)

Alguns pagamentos chegam ao Mercado Pago sem preference ou pedido QR vinculado (transferência direta, QR estático). O BizCode detecta e reconcilia com faturas em aberto de forma automática ou assistida.

1. **Job diário** (`npm run mercadopago:reconciliacion`, cron recomendado `0 * * * *` para 02:00 horário local por tenant): busca pagamentos `approved` dos últimos 2 dias; ignora pagamentos já registrados em `MercadoPagoProcessedPayment`.
2. **Auto-match:** quando o CNPJ/CPF do pagador coincide com um cliente e há uma única fatura em aberto com o mesmo saldo pendente exato → cria `ReciboCobro` e marca a entrada `reconciled`. Valores parciais ou matches ambíguos ficam na fila manual.
3. **Fila manual:** **Finanças → Reconciliação Mercado Pago** (`/finanzas/reconciliacion-mp`, integração `mercadopago`, `reports.financial.read`): lista pagamentos pendentes; carregue faturas em aberto por ID do cliente; **Reconciliar** (`POST /api/mercadopago/reconciliar`) ou **Ignorar** (`POST /api/mercadopago/ignorar`).
4. **Job sob demanda:** a equipe pode executar `POST /api/mercadopago/reconciliacion/run` pela UI.

## Reembolsos e chargebacks Mercado Pago (#179, #344)

**Reembolso total e parcial** quando `mpEstado` é **approved** e existe recibo MP vinculado.

1. **Reembolso:** Em **Faturamento → detalhe da fatura**, usuários com **`sales.cancel`** e módulo **`billing.credit_notes`** veem **Reembolsar pagamento MP**. Motivo (mín. 10 caracteres) e opcionalmente **valor parcial** (padrão: saldo reembolsável restante). `POST /api/facturas/{id}/mp/reembolso`. **Parcial:** nota de crédito parcial (#344) + reversão parcial do recibo; a fatura permanece ativa. **Total** (saldo restante): anula recibo, cancela fatura com NC (#146, valor NC restante se houver parciais anteriores), `mpEstado: refunded`. Valores acima do saldo reembolsável: `422 exceeds_refundable_balance`.
2. **Status de reembolsos:** `GET /api/facturas/{id}/mp/reembolso` retorna `refundableBalance`, `originalPaymentAmount` e histórico; o diálogo lista cada reembolso (`iniciado` → `procesando` → `completado` / `fallido`).
3. **Chargebacks:** o webhook `type: chargebacks` cria `MercadoPagoChargeback` (`pendiente`) e notifica managers. **Sem void nem NC automática** — a equipe resolve manualmente. Fila: **Finanças → Chargebacks Mercado Pago** (`/finanzas/contracargos-mp`, `reports.financial.read`); marcar **Resolvido** ou **Ignorar** via `PATCH /api/mercadopago/contracargos/{id}`.

## Referência API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — rotas `/api/reportes/aging`, `/api/reportes/cuenta-corriente/{clienteId}` e `/api/clientes/{id}/cuenta-corriente/*`.

## Notas de crédito (`billing.credit_notes`)

Com o módulo **`billing.credit_notes`** habilitado, a página inclui a seção **Notas de crédito**: filtre **de** / **até** (em `createdAt` da nota) e opcionalmente por **ID do cliente** (cliente da nota de origem). Os dados vêm de `GET /api/notas-credito` (exige **`reports.financial.read`** ou **`reports.operational.read`**; esta tela só é alcançada com acesso aos relatórios financeiros). Veja [ADR-0012](../adr/ADR-0012-anulacao-fatura-nota-credito.md) e o manual de faturamento para cancelamento.

## Livro IVA Vendas — Fase 1 (`finance.ledger`, #147)

Com o módulo **`finance.ledger`**, a seção **Contabilidade — Livro IVA Vendas** permite escolher o **período**, ver **pré-visualização** e baixar **ARCA (ZIP)** ou **Excel** (revisão interna). Veja [ADR-0013](../adr/ADR-0013-libro-iva-ventas-fase1.md).

## Livro IVA Compras (`finance.ledger`, #306)

Abaixo de vendas, **Contabilidade — Livro IVA Compras**: use o formulário **Cadastro de comprovante de compra** (fornecedor, data, tipo A/B/C, PV, número, líquidos, IVA, total; CAE opcional). A API `POST /api/comprobantes-compra` permanece para integrações.

**Importar documento de compra** (#277): envie PDF ou imagem (até 20 arquivos por lote), incluindo **Tirar foto** no celular (`capture="environment"`). Tiers locais: QR AFIP/ARCA (Tier 1), texto PDF + templates YAML (Tier 2, Argentina/Brasil/Uruguai incluídos), OCR (`spa+eng+por`) + templates (Tier 3), Ollama opcional com `OLLAMA_URL` (Tier 4, pode retornar itens). O preview mostra cabeçalho e **tabela de itens** com indicadores de confiança; mapeie cada linha com **Buscar artigo**, **Criar artigo** inline ou **Ignorar linha** (sugestões do catálogo do fornecedor quando houver). Se CUIT/CNPJ/RUT não coincidir, use **Criar fornecedor** inline. **Duplicados:** `GET /api/documentos-compra/verificar-duplicado` alerta antes de confirmar se o mesmo fornecedor já tem comprovante ativo com mesmo tipo/prefixo/número; a confirmação fica bloqueada até resolver. Os originais ficam no filesystem local (`DOCUMENTOS_COMPRA_STORAGE_PATH`) — implantação desktop-first conforme [PROD-VISION-001](../quality/visao-produto-e-implantacao.md); S3 não se aplica nesta entrega. **Estoque em remitos** não é atualizado automaticamente; itens ficam como snapshot em `datosExtraidos` (issue de acompanhamento). Revise a fila e confirme para criar `ComprobanteCompra`. APIs: `POST /api/documentos-compra/procesar`, `POST /api/documentos-compra/procesar-lote`, `GET /api/documentos-compra/cola`, `GET /api/documentos-compra/verificar-duplicado`, `POST /api/documentos-compra/confirmar`. Templates YAML custom: seção **Templates de extração** ou `GET`/`POST /api/documentos-compra/templates` (`settings.fiscal.manage`).

Escolha o **período**, pré-visualize (CBTU / ALICUOTAS) e baixe ZIP ou Excel ([ADR-0014](../adr/ADR-0014-libro-iva-compras.md)). Ordens de compra não substituem comprovantes fiscais de fornecedor.

## Retenções e percepções (`finance.retenciones`, #228)

Configure regimes e flags de agente em **Configurações → Empresa → Retenções e percepções** (`settings.fiscal.manage`). APIs: `GET/POST/PUT /api/fiscal/regimenes`, `GET/PUT /api/fiscal/config-retenciones`, `GET /api/fiscal/retenciones` (histórico), `GET /api/fiscal/retenciones/preview` (`entidadTipo=proveedor` #276; `entidadTipo=cliente` com `contexto=factura` em `POST /api/facturas` ou `contexto=cobro` em `POST /api/cobros` #229); `GET /api/cobros/{id}/retenciones`. **Remessas (#230):** módulo `fiscal.remito`; `GET/POST /api/remitos`, ciclo emitir/entregar/anular, `GET /api/remitos/{id}/pdf`; criação via `POST /api/pedidos/{id}/remito` ou `POST /api/facturas/{id}/remito` (documental; estoque na fatura). e-Remito AFIP não implementado.

**Cheques (#231):** módulo `fiscal.cheques`; carteira em **Finanças** (`GET /api/cheques`, `GET /api/cheques/resumen`, transições depositar/endossar/compensar/rejeitar/anular). Alta ao registrar recebimento (`chequeNuevo` em `POST /api/cobros`) ou endosso ao pagar fornecedor (`chequeId` em `POST /api/proveedores/{id}/pagos` com `cheque`/`echeq`). Alertas `cheque_due_soon` (≤3 dias) via `POST /api/cheques/alertas/run`; rejeição notifica `cheque_rechazado`. Sem conciliação bancária nem status ECHEQ automático nesta versão.

## Extratos bancários (#190)

Módulo `finance.bank_reconcile`. Em **Finanças** você pode:

1. Cadastrar contas (`POST /api/bancos/cuentas`) com CBU de 22 dígitos.
2. Importar extratos CSV, OFX ou MT940 (`POST /api/bancos/cuentas/{id}/importar`).
3. Configurar mapeamentos CSV por código de banco (`GET/POST/PATCH /api/bancos/csv-mappings`) — seeds para Galicia, Santander, BBVA, Macro e Nación; novos bancos sem redeploy.
4. Listar movimentos importados (`GET /api/bancos/cuentas/{id}/movimientos`).

A deduplicação usa data+valor+tipo+referência+descrição.

## Conciliação bancária e matching (#191)

Módulo `finance.bank_reconcile`, `reports.financial.read`; ações de escrita (executar matching, confirmar/ignorar, atribuição manual, bloquear/desbloquear) exigem papel owner/manager/super_admin. Em **Finanças → Conciliação bancária** (`/finanzas/conciliacion-bancaria`):

1. **Selecione conta e período** (`desde`/`hasta`) para carregar os movimentos e um resumo de status conciliado/sugerido/sem conciliar (`GET /api/bancos/cuentas/{id}/conciliacion`).
2. **Executar matching** (`POST .../conciliacion/run`): o motor puro `matchEngine` pontua cada movimento sem conciliar ou sugerido contra candidatos abertos de `ReciboCobroForma` (formas transferência/cheque) e `Cobro`, por valor, uma janela de tolerância de data e — quando disponível — o `cbu`/`alias` do cliente (configurável no formulário de **Clientes**). Os movimentos ficam `matched_auto` quando há um único candidato de alta confiança, `suggested` quando há vários candidatos ou de menor confiança, ou permanecem `unmatched`.
3. **Revise a tabela:** cada linha mostra o movimento do extrato, um status colorido (verde = conciliado automático, amarelo = sugerido, vermelho = sem conciliar) e ações:
   - **Confirmar sugestão** (`POST /api/bancos/movimientos/{movId}/sugerencia/confirmar`) aceita a sugestão de maior pontuação como match manual.
   - **Atribuição manual** (`POST .../conciliar` com `{ tipo: 'recibo_forma' | 'cobro', id }`) vincula o movimento a uma forma de recibo ou cobrança específica por ID.
   - **Ignorar** (`POST .../ignorar`) marca o movimento como revisado sem match (por exemplo, transferências entre contas próprias).
   - **Despesa bancária** (`POST .../gasto-bancario`) marca um movimento de débito como despesa/tarifa bancária, excluindo-o da conciliação pendente.
4. **Exporte** a visão atual para Excel (`GET .../conciliacion/export.xlsx`).
5. **Bloqueie/desbloqueie um período** (`YYYY-MM`) com `POST`/`DELETE /api/bancos/cuentas/{id}/periodos/{periodo}/lock` para impedir novas edições de conciliação após o fechamento do mês.

O `cbu`/`alias` do cliente (opcionais, editáveis no formulário de cliente) melhoram a confiança do matching automático de transferências; ambos os campos são apagados na anonimização do cliente (#195).

**Apresentações SICORE/SIFERE (#242):** em **Finanças → Apresentações fiscais** (`finance.retenciones`, `reports.financial.read`): selecione período e formato (SICORE nacional ou SIFERE IIBB), pré-visualização com totais por regime e avisos de CUIT, download TXT (`POST /api/fiscal/presentaciones` + `GET .../{id}/archivo`), histórico e marca «apresentado» após envio à AFIP/COMARB. APIs: `GET /api/fiscal/presentaciones/preview?formato=sicore|sifere&periodo=YYYY-MM`, `POST/GET /api/fiscal/presentaciones`, `PATCH /api/fiscal/presentaciones/{id}/presentado`. Exportação direta legada: `GET /api/fiscal/retenciones/export`. Valide os arquivos em homologação oficial manualmente.

A condição IVA de clientes/fornecedores usa `condIva` do cadastro. A consulta ao Padrón A4 AFIP por CUIT (#192) está disponível no formulário de cliente — veja o [Manual de Clientes](manual-clientes.md#consulta-padrón-a4-afip-192).

**Outros idiomas:** [English](../../en/user/manual-finance.md) · [Español](../../es/user/manual-finanzas.md)
