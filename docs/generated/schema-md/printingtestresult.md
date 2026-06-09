# PrintingTestResult Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PrintingTestResult.schema.json](../schema-json/PrintingTestResult.schema.json "open original schema") |

## PrintingTestResult Type

`object` ([PrintingTestResult](printingtestresult.md))

# PrintingTestResult Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [channel](#channel)             | `string`  | Required | cannot be null | [PrintingTestResult](printingtestresult-properties-channel.md "undefined#/properties/channel")             |
| [device](#device)               | `string`  | Required | cannot be null | [PrintingTestResult](printingtestresult-properties-device.md "undefined#/properties/device")               |
| [fallbackToPdf](#fallbacktopdf) | `boolean` | Required | cannot be null | [PrintingTestResult](printingtestresult-properties-fallbacktopdf.md "undefined#/properties/fallbackToPdf") |
| [jobId](#jobid)                 | `string`  | Optional | cannot be null | [PrintingTestResult](printingtestresult-properties-jobid.md "undefined#/properties/jobId")                 |
| [transport](#transport)         | `string`  | Optional | cannot be null | [PrintingTestResult](printingtestresult-properties-transport.md "undefined#/properties/transport")         |

## channel



`channel`

* is required

* Type: `string`

* cannot be null

* defined in: [PrintingTestResult](printingtestresult-properties-channel.md "undefined#/properties/channel")

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

* defined in: [PrintingTestResult](printingtestresult-properties-device.md "undefined#/properties/device")

### device Type

`string`

### device Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"fiscal"`  |             |
| `"thermal"` |             |

## fallbackToPdf



`fallbackToPdf`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PrintingTestResult](printingtestresult-properties-fallbacktopdf.md "undefined#/properties/fallbackToPdf")

### fallbackToPdf Type

`boolean`

## jobId



`jobId`

* is optional

* Type: `string`

* cannot be null

* defined in: [PrintingTestResult](printingtestresult-properties-jobid.md "undefined#/properties/jobId")

### jobId Type

`string`

## transport



`transport`

* is optional

* Type: `string`

* cannot be null

* defined in: [PrintingTestResult](printingtestresult-properties-transport.md "undefined#/properties/transport")

### transport Type

`string`

### transport Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"mock-serial"` |             |
