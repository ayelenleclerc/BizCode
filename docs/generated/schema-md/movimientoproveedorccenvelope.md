# MovimientoProveedorCCEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MovimientoProveedorCCEnvelope.schema.json](../schema-json/MovimientoProveedorCCEnvelope.schema.json "open original schema") |

## MovimientoProveedorCCEnvelope Type

`object` ([MovimientoProveedorCCEnvelope](movimientoproveedorccenvelope.md))

# MovimientoProveedorCCEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [MovimientoProveedorCCEnvelope](movimientoproveedorcc.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [MovimientoProveedorCCEnvelope](movimientoproveedorccenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([MovimientoProveedorCC](movimientoproveedorcc.md))

* cannot be null

* defined in: [MovimientoProveedorCCEnvelope](movimientoproveedorcc.md "undefined#/properties/data")

### data Type

`object` ([MovimientoProveedorCC](movimientoproveedorcc.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [MovimientoProveedorCCEnvelope](movimientoproveedorccenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
