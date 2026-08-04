# Untitled object in MeliOrdenListEnvelope Schema

```txt
undefined#/allOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MeliOrdenListEnvelope.schema.json\*](../schema-json/MeliOrdenListEnvelope.schema.json "open original schema") |

## 0 Type

`object` ([Details](meliordenlistenvelope-allof-0.md))

# 0 Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [MeliOrdenListEnvelope](meliordenlistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [MeliOrdenListEnvelope](meliordenlistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([MeliOrden](meliorden.md))

* cannot be null

* defined in: [MeliOrdenListEnvelope](meliordenlistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")

### data Type

`object[]` ([MeliOrden](meliorden.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MeliOrdenListEnvelope](meliordenlistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
