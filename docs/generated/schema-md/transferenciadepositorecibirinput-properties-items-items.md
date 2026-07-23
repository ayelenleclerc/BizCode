# Untitled object in TransferenciaDepositoRecibirInput Schema

```txt
undefined#/properties/items/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TransferenciaDepositoRecibirInput.schema.json\*](../schema-json/TransferenciaDepositoRecibirInput.schema.json "open original schema") |

## items Type

`object` ([Details](transferenciadepositorecibirinput-properties-items-items.md))

# items Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                                                                                                   |
| :------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)             | `integer` | Required | cannot be null | [TransferenciaDepositoRecibirInput](transferenciadepositorecibirinput-properties-items-items-properties-articuloid.md "undefined#/properties/items/items/properties/articuloId")             |
| [cantidadRecibida](#cantidadrecibida) | `integer` | Required | cannot be null | [TransferenciaDepositoRecibirInput](transferenciadepositorecibirinput-properties-items-items-properties-cantidadrecibida.md "undefined#/properties/items/items/properties/cantidadRecibida") |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [TransferenciaDepositoRecibirInput](transferenciadepositorecibirinput-properties-items-items-properties-articuloid.md "undefined#/properties/items/items/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantidadRecibida



`cantidadRecibida`

* is required

* Type: `integer`

* cannot be null

* defined in: [TransferenciaDepositoRecibirInput](transferenciadepositorecibirinput-properties-items-items-properties-cantidadrecibida.md "undefined#/properties/items/items/properties/cantidadRecibida")

### cantidadRecibida Type

`integer`

### cantidadRecibida Constraints

**minimum**: the value of this number must greater than or equal to: `0`
