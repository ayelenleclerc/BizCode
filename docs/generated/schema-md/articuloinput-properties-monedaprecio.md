# Untitled string in ArticuloInput Schema

```txt
undefined#/properties/monedaPrecio
```

Catalog price currency; ARS materializes precioLista1 directly (#243).

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [ArticuloInput.schema.json\*](../schema-json/ArticuloInput.schema.json "open original schema") |

## monedaPrecio Type

`string`

## monedaPrecio Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value   | Explanation |
| :------ | :---------- |
| `"ARS"` |             |
| `"USD"` |             |
| `"EUR"` |             |

## monedaPrecio Default Value

The default value is:

```json
"ARS"
```
