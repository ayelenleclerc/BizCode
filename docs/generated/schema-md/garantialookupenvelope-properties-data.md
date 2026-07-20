# Untitled object in GarantiaLookupEnvelope Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [GarantiaLookupEnvelope.schema.json\*](../schema-json/GarantiaLookupEnvelope.schema.json "open original schema") |

## data Type

`object` ([Details](garantialookupenvelope-properties-data.md))

# data Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                                                                           |
| :-------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| [garantia](#garantia) | `object` | Optional | cannot be null | [GarantiaLookupEnvelope](garantia.md "undefined#/properties/data/properties/garantia")                                               |
| [status](#status)     | `string` | Required | cannot be null | [GarantiaLookupEnvelope](garantialookupenvelope-properties-data-properties-status.md "undefined#/properties/data/properties/status") |

## garantia



`garantia`

* is optional

* Type: `object` ([Garantia](garantia.md))

* cannot be null

* defined in: [GarantiaLookupEnvelope](garantia.md "undefined#/properties/data/properties/garantia")

### garantia Type

`object` ([Garantia](garantia.md))

## status



`status`

* is required

* Type: `string`

* cannot be null

* defined in: [GarantiaLookupEnvelope](garantialookupenvelope-properties-data-properties-status.md "undefined#/properties/data/properties/status")

### status Type

`string`

### status Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value            | Explanation |
| :--------------- | :---------- |
| `"vigente"`      |             |
| `"vencida"`      |             |
| `"sin_registro"` |             |
