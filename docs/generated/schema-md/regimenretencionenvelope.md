# RegimenRetencionEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RegimenRetencionEnvelope.schema.json](../schema-json/RegimenRetencionEnvelope.schema.json "open original schema") |

## RegimenRetencionEnvelope Type

`object` ([RegimenRetencionEnvelope](regimenretencionenvelope.md))

# RegimenRetencionEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [RegimenRetencionEnvelope](regimenretencion.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [RegimenRetencionEnvelope](regimenretencionenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([RegimenRetencion](regimenretencion.md))

* cannot be null

* defined in: [RegimenRetencionEnvelope](regimenretencion.md "undefined#/properties/data")

### data Type

`object` ([RegimenRetencion](regimenretencion.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RegimenRetencionEnvelope](regimenretencionenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
