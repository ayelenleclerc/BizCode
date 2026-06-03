# PrintingStatus Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PrintingStatusEnvelope.schema.json\*](../schema-json/PrintingStatusEnvelope.schema.json "open original schema") |

## data Type

`object` ([PrintingStatus](printingstatus.md))

# data Properties

| Property                                      | Type      | Required | Nullable       | Defined by                                                                                                       |
| :-------------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [fiscalMode](#fiscalmode)                     | `string`  | Required | cannot be null | [PrintingStatus](printingstatus-properties-fiscalmode.md "undefined#/properties/fiscalMode")                     |
| [fiscalPrinterEnabled](#fiscalprinterenabled) | `boolean` | Required | cannot be null | [PrintingStatus](printingstatus-properties-fiscalprinterenabled.md "undefined#/properties/fiscalPrinterEnabled") |
| [thermalMode](#thermalmode)                   | `string`  | Required | cannot be null | [PrintingStatus](printingstatus-properties-thermalmode.md "undefined#/properties/thermalMode")                   |

## fiscalMode



`fiscalMode`

* is required

* Type: `string`

* cannot be null

* defined in: [PrintingStatus](printingstatus-properties-fiscalmode.md "undefined#/properties/fiscalMode")

### fiscalMode Type

`string`

### fiscalMode Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value    | Explanation |
| :------- | :---------- |
| `"mock"` |             |

## fiscalPrinterEnabled



`fiscalPrinterEnabled`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PrintingStatus](printingstatus-properties-fiscalprinterenabled.md "undefined#/properties/fiscalPrinterEnabled")

### fiscalPrinterEnabled Type

`boolean`

## thermalMode



`thermalMode`

* is required

* Type: `string`

* cannot be null

* defined in: [PrintingStatus](printingstatus-properties-thermalmode.md "undefined#/properties/thermalMode")

### thermalMode Type

`string`

### thermalMode Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value    | Explanation |
| :------- | :---------- |
| `"mock"` |             |
