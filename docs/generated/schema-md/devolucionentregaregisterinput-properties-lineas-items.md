# Untitled object in DevolucionEntregaRegisterInput Schema

```txt
undefined#/properties/lineas/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DevolucionEntregaRegisterInput.schema.json\*](../schema-json/DevolucionEntregaRegisterInput.schema.json "open original schema") |

## items Type

`object` ([Details](devolucionentregaregisterinput-properties-lineas-items.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                                                                                         |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)       | `integer` | Required | cannot be null | [DevolucionEntregaRegisterInput](devolucionentregaregisterinput-properties-lineas-items-properties-articuloid.md "undefined#/properties/lineas/items/properties/articuloId")       |
| [cantidad](#cantidad)           | `number`  | Required | cannot be null | [DevolucionEntregaRegisterInput](devolucionentregaregisterinput-properties-lineas-items-properties-cantidad.md "undefined#/properties/lineas/items/properties/cantidad")           |
| [facturaItemId](#facturaitemid) | `integer` | Optional | cannot be null | [DevolucionEntregaRegisterInput](devolucionentregaregisterinput-properties-lineas-items-properties-facturaitemid.md "undefined#/properties/lineas/items/properties/facturaItemId") |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [DevolucionEntregaRegisterInput](devolucionentregaregisterinput-properties-lineas-items-properties-articuloid.md "undefined#/properties/lineas/items/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantidad



`cantidad`

* is required

* Type: `number`

* cannot be null

* defined in: [DevolucionEntregaRegisterInput](devolucionentregaregisterinput-properties-lineas-items-properties-cantidad.md "undefined#/properties/lineas/items/properties/cantidad")

### cantidad Type

`number`

### cantidad Constraints

**minimum (exclusive)**: the value of this number must be greater than: `0`

## facturaItemId



`facturaItemId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [DevolucionEntregaRegisterInput](devolucionentregaregisterinput-properties-lineas-items-properties-facturaitemid.md "undefined#/properties/lineas/items/properties/facturaItemId")

### facturaItemId Type

`integer`

### facturaItemId Constraints

**minimum**: the value of this number must greater than or equal to: `1`
