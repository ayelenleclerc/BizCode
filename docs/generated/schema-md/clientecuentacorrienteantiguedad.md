# ClienteCuentaCorrienteAntiguedad Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteCuentaCorrienteAntiguedadEnvelope.schema.json\*](../schema-json/ClienteCuentaCorrienteAntiguedadEnvelope.schema.json "open original schema") |

## data Type

`object` ([ClienteCuentaCorrienteAntiguedad](clientecuentacorrienteantiguedad.md))

# data Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                                                               |
| :-------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| [buckets](#buckets)               | `array`   | Required | cannot be null | [ClienteCuentaCorrienteAntiguedad](clientecuentacorrienteantiguedad-properties-buckets.md "undefined#/properties/buckets")               |
| [clienteId](#clienteid)           | `integer` | Required | cannot be null | [ClienteCuentaCorrienteAntiguedad](clientecuentacorrienteantiguedad-properties-clienteid.md "undefined#/properties/clienteId")           |
| [moneda](#moneda)                 | `string`  | Required | cannot be null | [ClienteCuentaCorrienteAntiguedad](clientecuentacorrienteantiguedad-properties-moneda.md "undefined#/properties/moneda")                 |
| [totalPendiente](#totalpendiente) | `string`  | Required | cannot be null | [ClienteCuentaCorrienteAntiguedad](clientecuentacorrienteantiguedad-properties-totalpendiente.md "undefined#/properties/totalPendiente") |

## buckets



`buckets`

* is required

* Type: `object[]` ([ClienteCuentaCorrienteAntiguedadBucket](clientecuentacorrienteantiguedadbucket.md))

* cannot be null

* defined in: [ClienteCuentaCorrienteAntiguedad](clientecuentacorrienteantiguedad-properties-buckets.md "undefined#/properties/buckets")

### buckets Type

`object[]` ([ClienteCuentaCorrienteAntiguedadBucket](clientecuentacorrienteantiguedadbucket.md))

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ClienteCuentaCorrienteAntiguedad](clientecuentacorrienteantiguedad-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## moneda

Currency the buckets are expressed in (#206).

`moneda`

* is required

* Type: `string`

* cannot be null

* defined in: [ClienteCuentaCorrienteAntiguedad](clientecuentacorrienteantiguedad-properties-moneda.md "undefined#/properties/moneda")

### moneda Type

`string`

### moneda Constraints

**maximum length**: the maximum number of characters for this string is: `3`

**minimum length**: the minimum number of characters for this string is: `3`

## totalPendiente



`totalPendiente`

* is required

* Type: `string`

* cannot be null

* defined in: [ClienteCuentaCorrienteAntiguedad](clientecuentacorrienteantiguedad-properties-totalpendiente.md "undefined#/properties/totalPendiente")

### totalPendiente Type

`string`
