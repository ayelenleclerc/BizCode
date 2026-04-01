# Modelos de registros de qualidade

## Modelo: registro de não conformidade

**Referência normativa:** ISO 9001:2015 §10.2.2

```
Não conformidade #: NC-YYYYMMDD-NNN
Data de detecção: AAAA-MM-DD
Detectado por: [nome / pipeline CI]
Etapa: [ ] Revisão de código  [ ] CI  [ ] Teste manual  [ ] Produção

DESCRIÇÃO:
Descreva brevemente a não conformidade (o que ocorreu, onde, quando).

CAUSA RAIZ (5 porquês):
1. Por que ocorreu? →
2. Por que isso ocorreu? →
3. Por que isso ocorreu? →
4. Por que isso ocorreu? →
5. Causa raiz identificada:

AÇÃO CORRETIVA:
Descreva a correção implementada. Referência de commit ou PR: #XXX

AÇÃO PREVENTIVA:
Descreva a medida para evitar recorrência
(ex.: novo caso de teste, nova regra ESLint, atualização do DoD).

VERIFICAÇÃO:
[ ] Teste que reproduz o defeito foi adicionado e passa
[ ] Pipeline CI verde com a correção
[ ] Revisado por:                     Data:

Estado: [ ] Aberta  [ ] Em andamento  [ ] Encerrada
Data de encerramento:
```

---

## Modelo: registro de mudança

```
Mudança #: CHG-YYYYMMDD-NNN
Tipo: [ ] Feature  [ ] Fix  [ ] Refactor  [ ] Docs  [ ] CI/CD
PR/Commit: #XXX

DESCRIÇÃO DA MUDANÇA:

ARQUIVOS AFETADOS:
-
-

IMPACTO EM TESTES:
[ ] Testes existentes ainda passam
[ ] Novos testes adicionados: (descrever)
[ ] Cobertura afetada: (antes / depois)

IMPACTO EM ACESSIBILIDADE:
[ ] N/A  [ ] Revisado com axe DevTools  [ ] jsx-a11y sem novos avisos

IMPACTO EM I18N:
[ ] Sem strings novas ou alteradas
[ ] Novas chaves nos 3 locales e check:i18n OK

APROVADO POR:                         Data:
```

---

## Modelo: sessão de teste manual

```
Sessão de teste #: TS-YYYYMMDD-NNN
Data: AAAA-MM-DD
Versão testada: (hash do commit ou tag)
Testador:

AMBIENTE:
SO: [ ] Windows 11  [ ] macOS  [ ] Linux
Modo: [ ] Dev (Vite)  [ ] Build Tauri

CASOS DE TESTE:

| # | Cenário | Resultado | Observações |
|---|---|---|---|
| 1 | Criar cliente novo com CUIT/CNPJ válido | [ ] OK  [ ] Falha | |
| 2 | Criar cliente com identificador inválido — ver erro | [ ] OK  [ ] Falha | |
| 3 | Buscar cliente por nome | [ ] OK  [ ] Falha | |
| 4 | Editar cliente existente | [ ] OK  [ ] Falha | |
| 5 | Criar produto novo | [ ] OK  [ ] Falha | |
| 6 | Emitir NF tipo A para RI com 2 itens mistos (21% e 10,5%) | [ ] OK  [ ] Falha | |
| 7 | Verificar cálculo de impostos na nota (base × alíquota) | [ ] OK  [ ] Falha | |
| 8 | Emitir NF tipo B para CF (imposto não discriminado) | [ ] OK  [ ] Falha | |
| 9 | Navegar tabela com teclado (↑↓ Enter) | [ ] OK  [ ] Falha | |
| 10 | Verificar troca de idioma (ES → EN → PT-BR) | [ ] OK  [ ] Falha | |

DEFEITOS ENCONTRADOS:
(Referenciar NC se abrir não conformidade)

VEREDITO: [ ] Aprovado  [ ] Aprovado com ressalvas  [ ] Rejeitado

Assinatura do testador:                     Data:
```

**Outros idiomas:** [English](../../en/certificacion-iso/records-template.md) · [Español](../../es/certificacion-iso/plantillas-registros.md)
