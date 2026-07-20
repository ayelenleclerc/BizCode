# Untitled object in OrdenTrabajoListEnvelope Schema

```txt
undefined#/allOf/0
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenTrabajoListEnvelope.schema.json\*](../schema-json/OrdenTrabajoListEnvelope.schema.json "open original schema") |

## 0 Type

`object` ([Details](ordentrabajolistenvelope-allof-0.md))

# 0 Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [counts](#counts)   | `object`  | Optional | cannot be null | [OrdenTrabajoListEnvelope](ordentrabajolistenvelope-allof-0-properties-counts.md "undefined#/allOf/0/properties/counts")   |
| [data](#data)       | `array`   | Required | cannot be null | [OrdenTrabajoListEnvelope](ordentrabajolistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [OrdenTrabajoListEnvelope](ordentrabajolistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success") |

## counts



`counts`

* is optional

* Type: `object` ([Details](ordentrabajolistenvelope-allof-0-properties-counts.md))

* cannot be null

* defined in: [OrdenTrabajoListEnvelope](ordentrabajolistenvelope-allof-0-properties-counts.md "undefined#/allOf/0/properties/counts")

### counts Type

`object` ([Details](ordentrabajolistenvelope-allof-0-properties-counts.md))

## data



`data`

* is required

* Type: `object[]` ([OrdenTrabajo](ordentrabajo.md))

* cannot be null

* defined in: [OrdenTrabajoListEnvelope](ordentrabajolistenvelope-allof-0-properties-data.md "undefined#/allOf/0/properties/data")

### data Type

`object[]` ([OrdenTrabajo](ordentrabajo.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [OrdenTrabajoListEnvelope](ordentrabajolistenvelope-allof-0-properties-success.md "undefined#/allOf/0/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
