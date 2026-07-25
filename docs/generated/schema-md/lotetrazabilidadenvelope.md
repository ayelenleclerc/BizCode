# LoteTrazabilidadEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [LoteTrazabilidadEnvelope.schema.json](../schema-json/LoteTrazabilidadEnvelope.schema.json "open original schema") |

## LoteTrazabilidadEnvelope Type

`object` ([LoteTrazabilidadEnvelope](lotetrazabilidadenvelope.md))

# LoteTrazabilidadEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                 |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [LoteTrazabilidadEnvelope](lotetrazabilidad.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [LoteTrazabilidadEnvelope](lotetrazabilidadenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([LoteTrazabilidad](lotetrazabilidad.md))

* cannot be null

* defined in: [LoteTrazabilidadEnvelope](lotetrazabilidad.md "undefined#/properties/data")

### data Type

`object` ([LoteTrazabilidad](lotetrazabilidad.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [LoteTrazabilidadEnvelope](lotetrazabilidadenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
