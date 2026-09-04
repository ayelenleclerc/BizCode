# FiscalDocumentCancelInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FiscalDocumentCancelInput.schema.json](../schema-json/FiscalDocumentCancelInput.schema.json "open original schema") |

## FiscalDocumentCancelInput Type

`object` ([FiscalDocumentCancelInput](fiscaldocumentcancelinput.md))

# FiscalDocumentCancelInput Properties

| Property                      | Type     | Required | Nullable       | Defined by                                                                                                             |
| :---------------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [documentType](#documenttype) | `string` | Optional | cannot be null | [FiscalDocumentCancelInput](fiscaldocumentcancelinput-properties-documenttype.md "undefined#/properties/documentType") |
| [reasonCode](#reasoncode)     | `string` | Required | cannot be null | [FiscalDocumentCancelInput](fiscaldocumentcancelinput-properties-reasoncode.md "undefined#/properties/reasonCode")     |

## documentType



`documentType`

* is optional

* Type: `string`

* cannot be null

* defined in: [FiscalDocumentCancelInput](fiscaldocumentcancelinput-properties-documenttype.md "undefined#/properties/documentType")

### documentType Type

`string`

### documentType Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"invoice"`     |             |
| `"credit_note"` |             |

### documentType Default Value

The default value is:

```json
"invoice"
```

## reasonCode

SAT CFDI cancel reason codes (#210)

`reasonCode`

* is required

* Type: `string`

* cannot be null

* defined in: [FiscalDocumentCancelInput](fiscaldocumentcancelinput-properties-reasoncode.md "undefined#/properties/reasonCode")

### reasonCode Type

`string`

### reasonCode Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value  | Explanation |
| :----- | :---------- |
| `"01"` |             |
| `"02"` |             |
| `"03"` |             |
| `"04"` |             |
