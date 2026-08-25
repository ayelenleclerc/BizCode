# OrdenCompraItemInput Schema

```txt
undefined#/properties/data/properties/lines/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReposicionOcCreatedEnvelope.schema.json\*](../schema-json/ReposicionOcCreatedEnvelope.schema.json "open original schema") |

## items Type

`object` ([OrdenCompraItemInput](ordencompraiteminput.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)       | `integer` | Required | cannot be null | [OrdenCompraItemInput](ordencompraiteminput-properties-articuloid.md "undefined#/properties/articuloId")       |
| [cantidad](#cantidad)           | `integer` | Required | cannot be null | [OrdenCompraItemInput](ordencompraiteminput-properties-cantidad.md "undefined#/properties/cantidad")           |
| [costoUnitario](#costounitario) | `number`  | Required | cannot be null | [OrdenCompraItemInput](ordencompraiteminput-properties-costounitario.md "undefined#/properties/costoUnitario") |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenCompraItemInput](ordencompraiteminput-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## cantidad



`cantidad`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenCompraItemInput](ordencompraiteminput-properties-cantidad.md "undefined#/properties/cantidad")

### cantidad Type

`integer`

### cantidad Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## costoUnitario



`costoUnitario`

* is required

* Type: `number`

* cannot be null

* defined in: [OrdenCompraItemInput](ordencompraiteminput-properties-costounitario.md "undefined#/properties/costoUnitario")

### costoUnitario Type

`number`

### costoUnitario Constraints

**minimum**: the value of this number must greater than or equal to: `0`
