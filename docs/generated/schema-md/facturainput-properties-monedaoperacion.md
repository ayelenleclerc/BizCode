# Untitled string in FacturaInput Schema

```txt
undefined#/properties/monedaOperacion
```

Export vertical (#206, module `vertical.export`). Currency the operation is denominated in. A non-local currency requires `totalMonedaOperacion` and `tipoCambioOperacion`; otherwise the request fails with 422. `total` stays in local currency and the AFIP circuit is untouched (no type E voucher, no `MonId`/`MonCotiz`).

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                   |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [FacturaInput.schema.json\*](../schema-json/FacturaInput.schema.json "open original schema") |

## monedaOperacion Type

`string`

## monedaOperacion Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value   | Explanation |
| :------ | :---------- |
| `"ARS"` |             |
| `"USD"` |             |
| `"EUR"` |             |
