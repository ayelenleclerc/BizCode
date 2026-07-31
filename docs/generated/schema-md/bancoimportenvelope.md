# BancoImportEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [BancoImportEnvelope.schema.json](../schema-json/BancoImportEnvelope.schema.json "open original schema") |

## BancoImportEnvelope Type

`object` ([BancoImportEnvelope](bancoimportenvelope.md))

# BancoImportEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [BancoImportEnvelope](bancoimportresult.md "undefined#/properties/data")                         |
| [success](#success) | `boolean` | Required | cannot be null | [BancoImportEnvelope](bancoimportenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([BancoImportResult](bancoimportresult.md))

* cannot be null

* defined in: [BancoImportEnvelope](bancoimportresult.md "undefined#/properties/data")

### data Type

`object` ([BancoImportResult](bancoimportresult.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [BancoImportEnvelope](bancoimportenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`
