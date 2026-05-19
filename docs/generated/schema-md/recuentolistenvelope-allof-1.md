# Untitled object in RecuentoListEnvelope Schema

```txt
undefined#/allOf/1
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RecuentoListEnvelope.schema.json\*](../schema-json/RecuentoListEnvelope.schema.json "open original schema") |

## 1 Type

`object` ([Details](recuentolistenvelope-allof-1.md))

# 1 Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [RecuentoListEnvelope](recuentolistenvelope-allof-1-properties-data.md "undefined#/allOf/1/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [RecuentoListEnvelope](recuentolistenvelope-allof-1-properties-success.md "undefined#/allOf/1/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([Recuento](recuento.md))

* cannot be null

* defined in: [RecuentoListEnvelope](recuentolistenvelope-allof-1-properties-data.md "undefined#/allOf/1/properties/data")

### data Type

`object[]` ([Recuento](recuento.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RecuentoListEnvelope](recuentolistenvelope-allof-1-properties-success.md "undefined#/allOf/1/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
