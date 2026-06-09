# FacturaPrintResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaPrintResult.schema.json](../schema-json/FacturaPrintResult.schema.json "open original schema") |

## FacturaPrintResult Type

`object` ([FacturaPrintResult](facturaprintresult.md))

# FacturaPrintResult Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [channel](#channel)             | `string`  | Required | cannot be null | [FacturaPrintResult](facturaprintresult-properties-channel.md "undefined#/properties/channel")             |
| [device](#device)               | `string`  | Required | cannot be null | [FacturaPrintResult](facturaprintresult-properties-device.md "undefined#/properties/device")               |
| [downloadPath](#downloadpath)   | `string`  | Optional | cannot be null | [FacturaPrintResult](facturaprintresult-properties-downloadpath.md "undefined#/properties/downloadPath")   |
| [fallbackToPdf](#fallbacktopdf) | `boolean` | Required | cannot be null | [FacturaPrintResult](facturaprintresult-properties-fallbacktopdf.md "undefined#/properties/fallbackToPdf") |
| [jobId](#jobid)                 | `string`  | Optional | cannot be null | [FacturaPrintResult](facturaprintresult-properties-jobid.md "undefined#/properties/jobId")                 |
| [transport](#transport)         | `string`  | Optional | cannot be null | [FacturaPrintResult](facturaprintresult-properties-transport.md "undefined#/properties/transport")         |

## channel



`channel`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaPrintResult](facturaprintresult-properties-channel.md "undefined#/properties/channel")

### channel Type

`string`

### channel Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value            | Explanation |
| :--------------- | :---------- |
| `"pdf"`          |             |
| `"fiscal_mock"`  |             |
| `"thermal_mock"` |             |

## device



`device`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaPrintResult](facturaprintresult-properties-device.md "undefined#/properties/device")

### device Type

`string`

### device Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"pdf"`     |             |
| `"fiscal"`  |             |
| `"thermal"` |             |

## downloadPath



`downloadPath`

* is optional

* Type: `string`

* cannot be null

* defined in: [FacturaPrintResult](facturaprintresult-properties-downloadpath.md "undefined#/properties/downloadPath")

### downloadPath Type

`string`

## fallbackToPdf



`fallbackToPdf`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FacturaPrintResult](facturaprintresult-properties-fallbacktopdf.md "undefined#/properties/fallbackToPdf")

### fallbackToPdf Type

`boolean`

## jobId



`jobId`

* is optional

* Type: `string`

* cannot be null

* defined in: [FacturaPrintResult](facturaprintresult-properties-jobid.md "undefined#/properties/jobId")

### jobId Type

`string`

## transport



`transport`

* is optional

* Type: `string`

* cannot be null

* defined in: [FacturaPrintResult](facturaprintresult-properties-transport.md "undefined#/properties/transport")

### transport Type

`string`

### transport Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"mock-serial"` |             |
