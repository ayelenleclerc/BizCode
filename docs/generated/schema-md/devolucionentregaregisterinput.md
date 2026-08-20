# DevolucionEntregaRegisterInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DevolucionEntregaRegisterInput.schema.json](../schema-json/DevolucionEntregaRegisterInput.schema.json "open original schema") |

## DevolucionEntregaRegisterInput Type

`object` ([DevolucionEntregaRegisterInput](devolucionentregaregisterinput.md))

# DevolucionEntregaRegisterInput Properties

| Property                        | Type     | Required | Nullable       | Defined by                                                                                                                         |
| :------------------------------ | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| [fotoBase64](#fotobase64)       | `string` | Optional | cannot be null | [DevolucionEntregaRegisterInput](devolucionentregaregisterinput-properties-fotobase64.md "undefined#/properties/fotoBase64")       |
| [lineas](#lineas)               | `array`  | Required | cannot be null | [DevolucionEntregaRegisterInput](devolucionentregaregisterinput-properties-lineas.md "undefined#/properties/lineas")               |
| [motivo](#motivo)               | `string` | Required | cannot be null | [DevolucionEntregaRegisterInput](devolucionentregaregisterinput-properties-motivo.md "undefined#/properties/motivo")               |
| [motivoDetalle](#motivodetalle) | `string` | Optional | cannot be null | [DevolucionEntregaRegisterInput](devolucionentregaregisterinput-properties-motivodetalle.md "undefined#/properties/motivoDetalle") |

## fotoBase64

Data URL or base64 photo; required for producto\_dañado; max \~200KB decoded.

`fotoBase64`

* is optional

* Type: `string`

* cannot be null

* defined in: [DevolucionEntregaRegisterInput](devolucionentregaregisterinput-properties-fotobase64.md "undefined#/properties/fotoBase64")

### fotoBase64 Type

`string`

## lineas



`lineas`

* is required

* Type: `object[]` ([Details](devolucionentregaregisterinput-properties-lineas-items.md))

* cannot be null

* defined in: [DevolucionEntregaRegisterInput](devolucionentregaregisterinput-properties-lineas.md "undefined#/properties/lineas")

### lineas Type

`object[]` ([Details](devolucionentregaregisterinput-properties-lineas-items.md))

### lineas Constraints

**minimum number of items**: the minimum number of items for this array is: `1`

## motivo



`motivo`

* is required

* Type: `string`

* cannot be null

* defined in: [DevolucionEntregaRegisterInput](devolucionentregaregisterinput-properties-motivo.md "undefined#/properties/motivo")

### motivo Type

`string`

### motivo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value               | Explanation |
| :------------------ | :---------- |
| `"rechazo"`         |             |
| `"producto_dañado"` |             |

## motivoDetalle



`motivoDetalle`

* is optional

* Type: `string`

* cannot be null

* defined in: [DevolucionEntregaRegisterInput](devolucionentregaregisterinput-properties-motivodetalle.md "undefined#/properties/motivoDetalle")

### motivoDetalle Type

`string`

### motivoDetalle Constraints

**maximum length**: the maximum number of characters for this string is: `500`
