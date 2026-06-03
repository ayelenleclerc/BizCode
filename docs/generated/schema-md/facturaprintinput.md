# FacturaPrintInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FacturaPrintInput.schema.json](../schema-json/FacturaPrintInput.schema.json "open original schema") |

## FacturaPrintInput Type

`object` ([FacturaPrintInput](facturaprintinput.md))

# FacturaPrintInput Properties

| Property          | Type     | Required | Nullable       | Defined by                                                                                 |
| :---------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [device](#device) | `string` | Required | cannot be null | [FacturaPrintInput](facturaprintinput-properties-device.md "undefined#/properties/device") |

## device



`device`

* is required

* Type: `string`

* cannot be null

* defined in: [FacturaPrintInput](facturaprintinput-properties-device.md "undefined#/properties/device")

### device Type

`string`

### device Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"pdf"`     |             |
| `"fiscal"`  |             |
| `"thermal"` |             |
