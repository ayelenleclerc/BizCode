# ClienteImportRowError Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClienteImportRowError.schema.json](../schema-json/ClienteImportRowError.schema.json "open original schema") |

## ClienteImportRowError Type

`object` ([ClienteImportRowError](clienteimportrowerror.md))

# ClienteImportRowError Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [message](#message) | `string`  | Required | cannot be null | [ClienteImportRowError](clienteimportrowerror-properties-message.md "undefined#/properties/message") |
| [row](#row)         | `integer` | Required | cannot be null | [ClienteImportRowError](clienteimportrowerror-properties-row.md "undefined#/properties/row")         |

## message



`message`

* is required

* Type: `string`

* cannot be null

* defined in: [ClienteImportRowError](clienteimportrowerror-properties-message.md "undefined#/properties/message")

### message Type

`string`

## row

Data row number in the file (row 1 is the header)

`row`

* is required

* Type: `integer`

* cannot be null

* defined in: [ClienteImportRowError](clienteimportrowerror-properties-row.md "undefined#/properties/row")

### row Type

`integer`

### row Constraints

**minimum**: the value of this number must greater than or equal to: `2`
