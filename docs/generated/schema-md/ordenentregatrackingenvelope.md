# OrdenEntregaTrackingEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenEntregaTrackingEnvelope.schema.json](../schema-json/OrdenEntregaTrackingEnvelope.schema.json "open original schema") |

## OrdenEntregaTrackingEnvelope Type

`object` ([OrdenEntregaTrackingEnvelope](ordenentregatrackingenvelope.md))

# OrdenEntregaTrackingEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                         |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [OrdenEntregaTrackingEnvelope](ordenentregatrackingview.md "undefined#/properties/data")                           |
| [success](#success) | `boolean` | Required | cannot be null | [OrdenEntregaTrackingEnvelope](ordenentregatrackingenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([OrdenEntregaTrackingView](ordenentregatrackingview.md))

* cannot be null

* defined in: [OrdenEntregaTrackingEnvelope](ordenentregatrackingview.md "undefined#/properties/data")

### data Type

`object` ([OrdenEntregaTrackingView](ordenentregatrackingview.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [OrdenEntregaTrackingEnvelope](ordenentregatrackingenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
