# FiscalDocumentAuthorizeEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [FiscalDocumentAuthorizeEnvelope.schema.json](../schema-json/FiscalDocumentAuthorizeEnvelope.schema.json "open original schema") |

## FiscalDocumentAuthorizeEnvelope Type

`object` ([FiscalDocumentAuthorizeEnvelope](fiscaldocumentauthorizeenvelope.md))

# FiscalDocumentAuthorizeEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [FiscalDocumentAuthorizeEnvelope](fiscaldocumentauthorizeenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [FiscalDocumentAuthorizeEnvelope](fiscaldocumentauthorizeenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([Details](fiscaldocumentauthorizeenvelope-properties-data.md))

* cannot be null

* defined in: [FiscalDocumentAuthorizeEnvelope](fiscaldocumentauthorizeenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](fiscaldocumentauthorizeenvelope-properties-data.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [FiscalDocumentAuthorizeEnvelope](fiscaldocumentauthorizeenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
