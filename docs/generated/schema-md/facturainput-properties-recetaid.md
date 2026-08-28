# Untitled integer in FacturaInput Schema

```txt
undefined#/properties/recetaId
```

Prescription backing the dispensing of prescription-only articles (#204). With module `vertical.pharmacy` enabled, invoicing an article flagged `requiereReceta` without this field fails with HTTP 422 `PRESCRIPTION_REQUIRED:<articuloIds>`.

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                   |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [FacturaInput.schema.json\*](../schema-json/FacturaInput.schema.json "open original schema") |

## recetaId Type

`integer`

## recetaId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
