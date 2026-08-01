# Untitled string in OrdenEntrega Schema

```txt
undefined#/properties/estadoEnvio
```

Carrier shipment status (#193), independent of OE estado.

| Abstract            | Extensible | Status         | Identifiable            | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                   |
| :------------------ | :--------- | :------------- | :---------------------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | Unknown identifiability | Forbidden         | Allowed               | none                | [OrdenEntrega.schema.json\*](../schema-json/OrdenEntrega.schema.json "open original schema") |

## estadoEnvio Type

`string`

## estadoEnvio Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"pending"`    |             |
| `"in_transit"` |             |
| `"delivered"`  |             |
| `"returned"`   |             |
