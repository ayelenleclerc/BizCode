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

## totalPendiente



`totalPendiente`

* is required

* Type: `string`

* cannot be null

* defined in: [ClienteCuentaCorrienteAntiguedad](clientecuentacorrienteantiguedad-properties-totalpendiente.md "undefined#/properties/totalPendiente")

### totalPendiente Type

`string`
