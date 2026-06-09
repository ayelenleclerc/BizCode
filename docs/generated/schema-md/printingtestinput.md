# PrintingTestInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PrintingTestInput.schema.json](../schema-json/PrintingTestInput.schema.json "open original schema") |

## PrintingTestInput Type

`object` ([PrintingTestInput](printingtestinput.md))

# PrintingTestInput Properties

| Property          | Type     | Required | Nullable       | Defined by                                                                                 |
| :---------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------- |
| [device](#device) | `string` | Required | cannot be null | [PrintingTestInput](printingtestinput-properties-device.md "undefined#/properties/device") |

## device



`device`

* is required

* Type: `string`

* cannot be null

* defined in: [PrintingTestInput](printingtestinput-properties-device.md "undefined#/properties/device")

### device Type

`string`

### device Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"fiscal"`  |             |
| `"thermal"` |             |
