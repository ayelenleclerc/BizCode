# Manual do usuário: Finanças

## Acesso

Clique em **Finanças** na barra lateral.

É necessário o permissão **`reports.financial.read`**. Sem ela, a página exibe mensagem de acesso negado.

## Aging de contas a receber

Ao carregar, a página consulta **`GET /api/reportes/aging`** e mostra faixas (rótulos, quantidade de faturas, totais). É possível ordenar por colunas quando a UI implementar.

## Extrato do cliente

1. Informe o **id do cliente** (inteiro positivo).
2. Execute a ação para carregar o extrato (`GET /api/reportes/cuenta-corriente/:clienteId`).
3. Revise as linhas com data, tipo, referência, débito, crédito e saldo acumulado.

Se o cliente não existir, a API retorna 404.

## Faturas vencidas e lembretes

A mesma página **Finanças** inclui uma seção de faturas vencidas (`GET /api/cobranzas/vencidas`):

1. Opcionalmente filtre por **dias mínimos em atraso**.
2. Revise a tabela (cliente, total, data, dias em atraso).
3. Use **Enviar lembrete** em uma linha para acionar `POST /api/cobranzas/recordatorios` (permissão `reports.financial.read`). Não é enviado mais de um lembrete por fatura no mesmo dia.

A configuração do job automático (dias de carência, fuso IANA, horário comercial) está em **Configurações → Empresa**. O job operacional `npm run cobranzas:recordatorios` percorre todos os tenants com parâmetros de empresa e envia às **08:00 horário local** dentro da janela configurada (veja [ciclo CI/CD](../quality/ciclo-ci-cd.md)).

## Referência API

[`docs/api/openapi.yaml`](../../api/openapi.yaml) — rotas `/api/reportes/aging` e `/api/reportes/cuenta-corriente/{clienteId}`.

## Notas de crédito (`billing.credit_notes`)

Com o módulo **`billing.credit_notes`** habilitado, a página inclui a seção **Notas de crédito**: filtre **de** / **até** (em `createdAt` da nota) e opcionalmente por **ID do cliente** (cliente da nota de origem). Os dados vêm de `GET /api/notas-credito` (exige **`reports.financial.read`** ou **`reports.operational.read`**; esta tela só é alcançada com acesso aos relatórios financeiros). Veja [ADR-0012](../adr/ADR-0012-anulacao-fatura-nota-credito.md) e o manual de faturamento para cancelamento.

## Livro IVA Vendas — Fase 1 (`finance.ledger`, #147)

Com o módulo **`finance.ledger`**, a seção **Contabilidade — Livro IVA Vendas** permite escolher o **período**, ver **pré-visualização** e baixar **ARCA (ZIP)** ou **Excel** (revisão interna). Veja [ADR-0013](../adr/ADR-0013-libro-iva-ventas-fase1.md).

## Livro IVA Compras (`finance.ledger`, #306)

Abaixo de vendas, **Contabilidade — Livro IVA Compras**: use o formulário **Cadastro de comprovante de compra** (fornecedor, data, tipo A/B/C, PV, número, líquidos, IVA, total; CAE opcional). A API `POST /api/comprobantes-compra` permanece para integrações.

**Importar documento de compra** (#277): envie PDF ou imagem (até 20 arquivos por lote), incluindo **Tirar foto** no celular (`capture="environment"`). Tiers locais: QR AFIP/ARCA (Tier 1), texto PDF + templates YAML (Tier 2, Argentina/Brasil/Uruguai incluídos), OCR (`spa+eng+por`) + templates (Tier 3), Ollama opcional com `OLLAMA_URL` (Tier 4, pode retornar itens). O preview mostra cabeçalho e **tabela de itens** com indicadores de confiança; mapeie cada linha com **Buscar artigo**, **Criar artigo** inline ou **Ignorar linha** (sugestões do catálogo do fornecedor quando houver). Se CUIT/CNPJ/RUT não coincidir, use **Criar fornecedor** inline. **Duplicados:** `GET /api/documentos-compra/verificar-duplicado` alerta antes de confirmar se o mesmo fornecedor já tem comprovante ativo com mesmo tipo/prefixo/número; a confirmação fica bloqueada até resolver. Os originais ficam no filesystem local (`DOCUMENTOS_COMPRA_STORAGE_PATH`) — implantação desktop-first conforme [PROD-VISION-001](../quality/visao-produto-e-implantacao.md); S3 não se aplica nesta entrega. **Estoque em remitos** não é atualizado automaticamente; itens ficam como snapshot em `datosExtraidos` (issue de acompanhamento). Revise a fila e confirme para criar `ComprobanteCompra`. APIs: `POST /api/documentos-compra/procesar`, `POST /api/documentos-compra/procesar-lote`, `GET /api/documentos-compra/cola`, `GET /api/documentos-compra/verificar-duplicado`, `POST /api/documentos-compra/confirmar`. Templates YAML custom: seção **Templates de extração** ou `GET`/`POST /api/documentos-compra/templates` (`settings.fiscal.manage`).

Escolha o **período**, pré-visualize (CBTU / ALICUOTAS) e baixe ZIP ou Excel ([ADR-0014](../adr/ADR-0014-libro-iva-compras.md)). Ordens de compra não substituem comprovantes fiscais de fornecedor.

**Outros idiomas:** [English](../../en/user/manual-finance.md) · [Español](../../es/user/manual-finanzas.md)
