# MeliCategorySearchEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MeliCategorySearchEnvelope.schema.json](../schema-json/MeliCategorySearchEnvelope.schema.json "open original schema") |

## MeliCategorySearchEnvelope Type

`object` ([MeliCategorySearchEnvelope](melicategorysearchenvelope.md))

# MeliCategorySearchEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [MeliCategorySearchEnvelope](melicategorysearchenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [MeliCategorySearchEnvelope](melicategorysearchenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([MeliCategorySearchHit](melicategorysearchhit.md))

* cannot be null

* defined in: [MeliCategorySearchEnvelope](melicategorysearchenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([MeliCategorySearchHit](melicategorysearchhit.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MeliCategorySearchEnvelope](melicategorysearchenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
