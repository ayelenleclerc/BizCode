# Untitled object in TransferenciaDepositoCreateInput Schema

```txt
undefined#/properties/items/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TransferenciaDepositoCreateInput.schema.json\*](../schema-json/TransferenciaDepositoCreateInput.schema.json "open original schema") |

## items Type

`object` ([Details](transferenciadepositocreateinput-properties-items-items.md))

# items Properties

| Property                            | Type      | Required | Nullable       | Defined by                                                                                                                                                                               |
| :---------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)           | `integer` | Required | cannot be null | [TransferenciaDepositoCreateInput](transferenciadepositocreateinput-properties-items-items-properties-articuloid.md "undefined#/properties/items/items/properties/articuloId")           |
| [cantidadEnviada](#cantidadenviada) | `integer` | Required | cannot be null | [TransferenciaDepositoCreateInput](transferenciadepositocreateinput-properties-items-items-properties-cantidadenviada.md "undefined#/properties/items/items/properties/cantidadEnviada") |

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [TransferenciaDepositoCreateInput](transferenciadepositocreateinput-properties-items-items-properties-articuloid.md "undefined#/properties/items/items/properties/articuloId")

### articuloId Type

`integer`

### articuloId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## cantidadEnviada



`cantidadEnviada`

* is required

* Type: `integer`

* cannot be null

* defined in: [TransferenciaDepositoCreateInput](transferenciadepositocreateinput-properties-items-items-properties-cantidadenviada.md "undefined#/properties/items/items/properties/cantidadEnviada")

### cantidadEnviada Type

`integer`

### cantidadEnviada Constraints

**minimum**: the value of this number must greater than or equal to: `1`
