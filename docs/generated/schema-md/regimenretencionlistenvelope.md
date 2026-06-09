# RegimenRetencionListEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RegimenRetencionListEnvelope.schema.json](../schema-json/RegimenRetencionListEnvelope.schema.json "open original schema") |

## RegimenRetencionListEnvelope Type

`object` ([RegimenRetencionListEnvelope](regimenretencionlistenvelope.md))

# RegimenRetencionListEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [RegimenRetencionListEnvelope](regimenretencionlistenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [RegimenRetencionListEnvelope](regimenretencionlistenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([RegimenRetencion](regimenretencion.md))

* cannot be null

* defined in: [RegimenRetencionListEnvelope](regimenretencionlistenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([RegimenRetencion](regimenretencion.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RegimenRetencionListEnvelope](regimenretencionlistenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
