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

**Apresentações SICORE/SIFERE (#242):** em **Finanças → Apresentações fiscais** (`finance.retenciones`, `reports.financial.read`): selecione período e formato (SICORE nacional ou SIFERE IIBB), pré-visualização com totais por regime e avisos de CUIT, download TXT (`POST /api/fiscal/presentaciones` + `GET .../{id}/archivo`), histórico e marca «apresentado» após envio à AFIP/COMARB. APIs: `GET /api/fiscal/presentaciones/preview?formato=sicore|sifere&periodo=YYYY-MM`, `POST/GET /api/fiscal/presentaciones`, `PATCH /api/fiscal/presentaciones/{id}/presentado`. Exportação direta legada: `GET /api/fiscal/retenciones/export`. Valide os arquivos em homologação oficial manualmente.

A condição IVA de clientes/fornecedores usa `condIva` do cadastro; consulta Padrão AFIP (#192) não implementada nesta entrega.

**Outros idiomas:** [English](../../en/user/manual-finance.md) · [Español](../../es/user/manual-finanzas.md)
