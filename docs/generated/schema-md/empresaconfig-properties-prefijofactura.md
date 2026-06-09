# Untitled string in EmpresaConfig Schema

```txt
undefined#/properties/prefijoFactura
```

Four-digit invoice prefix derived from puntoVenta.

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                     |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [EmpresaConfig.schema.json\*](../schema-json/EmpresaConfig.schema.json "open original schema") |

## prefijoFactura Type

`string`

## prefijoFactura Constraints

**pattern**: the string must match the following regular expression:&#x20;

```regexp
^[0-9]{4}$
```

[try pattern](https://regexr.com/?expression=%5E%5B0-9%5D%7B4%7D%24 "try regular expression with regexr.com")
