# ConfigFidelizacionEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConfigFidelizacionEnvelope.schema.json](../schema-json/ConfigFidelizacionEnvelope.schema.json "open original schema") |

## ConfigFidelizacionEnvelope Type

`object` ([ConfigFidelizacionEnvelope](configfidelizacionenvelope.md))

# ConfigFidelizacionEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [ConfigFidelizacionEnvelope](configfidelizacion.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [ConfigFidelizacionEnvelope](configfidelizacionenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([ConfigFidelizacion](configfidelizacion.md))

* cannot be null

* defined in: [ConfigFidelizacionEnvelope](configfidelizacion.md "undefined#/properties/data")

### data Type

`object` ([ConfigFidelizacion](configfidelizacion.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [ConfigFidelizacionEnvelope](configfidelizacionenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
