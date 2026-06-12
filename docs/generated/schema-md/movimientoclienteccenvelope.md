# MovimientoClienteCCEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MovimientoClienteCCEnvelope.schema.json](../schema-json/MovimientoClienteCCEnvelope.schema.json "open original schema") |

## MovimientoClienteCCEnvelope Type

`object` ([MovimientoClienteCCEnvelope](movimientoclienteccenvelope.md))

# MovimientoClienteCCEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MovimientoClienteCCEnvelope](movimientoclientecc.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [MovimientoClienteCCEnvelope](movimientoclienteccenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([MovimientoClienteCC](movimientoclientecc.md))

* cannot be null

* defined in: [MovimientoClienteCCEnvelope](movimientoclientecc.md "undefined#/properties/data")

### data Type

`object` ([MovimientoClienteCC](movimientoclientecc.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MovimientoClienteCCEnvelope](movimientoclienteccenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
