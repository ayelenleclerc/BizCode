# Manual do usuário: Clientes

## Acesso

Clique em **Clientes** na barra lateral ou navegue com as setas e **Enter**.

## Lista de clientes

Tabela com: **Código**, **Razão Social**, **CNPJ/CPF**, **Regime Fiscal**, **Telefone**, **Ativo**.

**Busca:** digite no campo (ou **F2** para focar). Filtra por código, razão social ou identificador.

**Navegar:** **↑** / **↓** para mover entre linhas; a linha selecionada fica destacada.

**Abrir para edição:** com uma linha selecionada, **Enter** ou duplo clique.

## Novo cliente

1. **F3** ou **➕ Novo (F3)**.
2. Abre o formulário **Novo Cliente**.
3. Preencha os campos e **F5** ou **Salvar (F5)**.

### Campos do formulário

| Campo | Obrigatório | Descrição |
|---|---|---|
| Código | Sim | Inteiro positivo. Não pode ser alterado após a criação. |
| Razão Social | Sim | Nome legal ou completo. Mínimo 3 caracteres. |
| Nome Fantasia | Não | Nome comercial (se diferente da razão social). |
| CNPJ/CPF | Não | Identificador fiscal (no código: validação tipo CUIT argentino). Formato `XX-XXXXXXXX-X`. |
| Regime Fiscal | Sim | RI, MEI/Simples, CF ou Isento — ver tabela abaixo. |
| Endereço | Não | Rua e número. |
| Cidade | Não | Localidade. |
| CEP | Não | Até 8 caracteres. |
| Telefone | Não | |
| E-mail | Não | |
| CBU | Não | CBU bancário de 22 dígitos, usado no matching de conciliação bancária (#191). O sistema valida os dígitos verificadores. |
| Alias | Não | Alias bancário (CVU/CBU), até 60 caracteres; também usado no matching de conciliação bancária (#191). |
| Ativo | Sim | Desmarque para inativar sem apagar histórico. |

### Regime fiscal (condição de IVA)

| Valor | Descrição na interface (pt-BR) | Nota fiscal típica (Argentina) |
|---|---|---|
| **RI** | RI - Contribuinte ICMS | Factura A (IVA discriminado) |
| **Mono** | MEI / Simples | Factura B (IVA incluído) |
| **CF** | CF - Consumidor Final | Factura B (IVA incluído) |
| **Isento** | Isento | Factura A ou B sem IVA, conforme regra |

### Validação do identificador

O sistema valida o dígito verificador. Em caso de erro, a mensagem é **«CNPJ/CPF inválido»**. Pode informar com ou sem hífens.

### Consulta Padrón A4 AFIP (#192)

Ao sair do campo CUIT (com Tab ou clicando em outro campo) com um dígito verificador válido, o formulário consulta automaticamente o Padrón A4 da AFIP (`GET /api/arca/padron/{cuit}`, com cache de 24h por empresa) e exibe uma mensagem de status ao lado do campo:

| Status | Significado |
|---|---|
| Consultando Padrón AFIP… | Consulta em andamento. |
| CUIT verificado no Padrón AFIP. | Encontrado — **Razão Social**, **Regime Fiscal**, **Endereço**, **Cidade** e **CEP** são preenchidos automaticamente com os dados da AFIP. |
| CUIT não encontrado no Padrón AFIP. | O CUIT é válido, mas não consta nos registros da AFIP; preencha os campos manualmente. |
| Consulta ao Padrón AFIP indisponível. | O módulo `billing.arca_cae` está desabilitado ou a empresa não tem certificado AFIP configurado; preencha os campos manualmente. |
| O Padrón AFIP não respondeu a tempo. | Timeout; preencha os campos manualmente. |
| CUIT inválido; a consulta ao Padrón AFIP não foi realizada. | O dígito verificador do CUIT é inválido. |

Se a razão social da AFIP (`razonSocial`) tiver mais de 30 caracteres, **Razão Social** é preenchida truncada em 30 caracteres e um aviso é exibido para revisão. Essa consulta **nunca bloqueia o salvamento do cliente** — você sempre pode preencher ou corrigir os campos manualmente e salvar. A homologação usa um mock (`ws_sr_padron_a4`); a integração SOAP AFIP ao vivo em produção fica fora de escopo nesta entrega.

## Editar cliente

1. Selecione o cliente na tabela.
2. **Enter** ou duplo clique.
3. Altere os campos (o **Código** não é editável).
4. **F5** ou **Salvar (F5)**.

## Inativar cliente

Edite o cliente e desmarque **Ativo**. O registro permanece para histórico de faturas.

## Importação em massa (CSV)

Usuários com permissão de gestão de clientes podem carregar muitos registros a partir de um arquivo **CSV em UTF-8**.

1. Na lista, abra **Importar CSV** (ou o controle equivalente).
2. **Baixe o modelo** no mesmo diálogo: inclui a linha de cabeçalhos obrigatória e um exemplo.
3. Não altere os nomes nem a ordem das colunas da primeira linha. Salve como `.csv` (UTF-8).
4. Anexe o arquivo e confirme. O sistema informa quantas linhas foram criadas e, se houver erros de validação ou duplicados, o detalhe **por linha** (a numeração das linhas de dados começa após o cabeçalho; a linha 1 é o cabeçalho). As regras seguem a mesma API REST de criação/edição; cada mensagem traz o **caminho do campo** (por exemplo `rsocial: …`) quando a linha é rejeitada.

**Política de duplicados:** se o **código** do cliente já existir na base ou estiver repetido no mesmo arquivo, a linha é rejeitada.

**Limites:** tamanho máximo do arquivo e quantidade máxima de linhas são aplicados pela API (veja OpenAPI em `/api-docs`).

## Cobranças recentes

Ao editar um cliente existente, o formulário exibe **cobranças recentes** carregadas de `GET /api/cobros?clienteId=…`. Use o link para abrir **Cobranças** filtrado por esse cliente ou registrar uma nova cobrança.

## Score de cobrança

O formulário de cliente mostra o **score de cobrança** (0–100) quando disponível, com tooltip que descreve como o score muda ao registrar cobranças contra faturas ativas. As regras estão documentadas no OpenAPI para `POST /api/cobros`.

## Portal B2B do cliente (#240)

Com o módulo **Portal do cliente** (`clients.portal`) habilitado, ative o portal em **Configuração → Empresa** (seção *Portal do cliente*): branding (logo, cor, rodapé) e seção de pedidos.

- **URL do portal (MVP):** `/portal/{slug-do-tenant}` na mesma aplicação web.
- **Acesso:** o cliente informa o e-mail cadastrado; recebe magic link válido por **15 minutos**; sessão de **8 horas**.
- **Seções:** faturas (PDF e status), conta corrente (saldo e PDF), pedidos (se habilitado) e dados de contato.
- **Isolamento:** cada cliente vê apenas seus documentos; `clienteId` não é aceito como parâmetro confiável na API.
- **Pagamento online (MercadoPago):** quando a equipe gerou um link de pagamento ativo (#175), o botão **Pagar online** do portal abre o checkout do Mercado Pago em uma nova aba.

Configure SMTP no servidor para envio dos magic links em produção.

## Atalhos de teclado

| Tecla | Ação |
|---|---|
| F2 | Focar busca |
| F3 | Novo cliente |
| F5 | Salvar formulário |
| ↑ / ↓ | Navegar linhas |
| Enter | Abrir cliente selecionado |
| Esc | Fechar formulário ou diálogo de importação sem salvar |

**Outros idiomas:** [English](../../en/user/manual-customers.md) · [Español](../../es/user/manual-clientes.md)
