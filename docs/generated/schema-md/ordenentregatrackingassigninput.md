# OrdenEntregaTrackingAssignInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenEntregaTrackingAssignInput.schema.json](../schema-json/OrdenEntregaTrackingAssignInput.schema.json "open original schema") |

## OrdenEntregaTrackingAssignInput Type

`object` ([OrdenEntregaTrackingAssignInput](ordenentregatrackingassigninput.md))

# OrdenEntregaTrackingAssignInput Properties

| Property                          | Type     | Required | Nullable       | Defined by                                                                                                                             |
| :-------------------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| [estadoEnvio](#estadoenvio)       | `string` | Optional | cannot be null | [OrdenEntregaTrackingAssignInput](ordenentregatrackingassigninput-properties-estadoenvio.md "undefined#/properties/estadoEnvio")       |
| [nroSeguimiento](#nroseguimiento) | `string` | Required | cannot be null | [OrdenEntregaTrackingAssignInput](ordenentregatrackingassigninput-properties-nroseguimiento.md "undefined#/properties/nroSeguimiento") |
| [transportista](#transportista)   | `string` | Required | cannot be null | [OrdenEntregaTrackingAssignInput](ordenentregatrackingassigninput-properties-transportista.md "undefined#/properties/transportista")   |

## estadoEnvio



`estadoEnvio`

* is optional

* Type: `string`

* cannot be null

* defined in: [OrdenEntregaTrackingAssignInput](ordenentregatrackingassigninput-properties-estadoenvio.md "undefined#/properties/estadoEnvio")

### estadoEnvio Type

`string`

### estadoEnvio Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"pending"`    |             |
| `"in_transit"` |             |
| `"delivered"`  |             |
| `"returned"`   |             |

## nroSeguimiento



`nroSeguimiento`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenEntregaTrackingAssignInput](ordenentregatrackingassigninput-properties-nroseguimiento.md "undefined#/properties/nroSeguimiento")

### nroSeguimiento Type

`string`

### nroSeguimiento Constraints

**maximum length**: the maximum number of characters for this string is: `80`

**minimum length**: the minimum number of characters for this string is: `1`

## transportista



`transportista`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenEntregaTrackingAssignInput](ordenentregatrackingassigninput-properties-transportista.md "undefined#/properties/transportista")

### transportista Type

`string`

### transportista Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                | Explanation |
| :------------------- | :---------- |
| `"correo_argentino"` |             |
| `"andreani"`         |             |
| `"propio"`           |             |
| `"meli_full"`        |             |
