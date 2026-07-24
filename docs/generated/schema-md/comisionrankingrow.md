# ComisionRankingRow Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ComisionRankingRow.schema.json](../schema-json/ComisionRankingRow.schema.json "open original schema") |

## ComisionRankingRow Type

`object` ([ComisionRankingRow](comisionrankingrow.md))

# ComisionRankingRow Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [estado](#estado)                     | `string`  | Required | cannot be null | [ComisionRankingRow](comisionrankingrow-properties-estado.md "undefined#/properties/estado")                     |
| [liquidacionId](#liquidacionid)       | `integer` | Required | cannot be null | [ComisionRankingRow](comisionrankingrow-properties-liquidacionid.md "undefined#/properties/liquidacionId")       |
| [totalComision](#totalcomision)       | `number`  | Required | cannot be null | [ComisionRankingRow](comisionrankingrow-properties-totalcomision.md "undefined#/properties/totalComision")       |
| [totalVentas](#totalventas)           | `number`  | Required | cannot be null | [ComisionRankingRow](comisionrankingrow-properties-totalventas.md "undefined#/properties/totalVentas")           |
| [vendedorId](#vendedorid)             | `integer` | Required | cannot be null | [ComisionRankingRow](comisionrankingrow-properties-vendedorid.md "undefined#/properties/vendedorId")             |
| [vendedorUsername](#vendedorusername) | `string`  | Required | cannot be null | [ComisionRankingRow](comisionrankingrow-properties-vendedorusername.md "undefined#/properties/vendedorUsername") |

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [ComisionRankingRow](comisionrankingrow-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"borrador"` |             |
| `"aprobada"` |             |
| `"pagada"`   |             |

## liquidacionId



`liquidacionId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ComisionRankingRow](comisionrankingrow-properties-liquidacionid.md "undefined#/properties/liquidacionId")

### liquidacionId Type

`integer`

## totalComision



`totalComision`

* is required

* Type: `number`

* cannot be null

* defined in: [ComisionRankingRow](comisionrankingrow-properties-totalcomision.md "undefined#/properties/totalComision")

### totalComision Type

`number`

## totalVentas



`totalVentas`

* is required

* Type: `number`

* cannot be null

* defined in: [ComisionRankingRow](comisionrankingrow-properties-totalventas.md "undefined#/properties/totalVentas")

### totalVentas Type

`number`

## vendedorId



`vendedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ComisionRankingRow](comisionrankingrow-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`

## vendedorUsername



`vendedorUsername`

* is required

* Type: `string`

* cannot be null

* defined in: [ComisionRankingRow](comisionrankingrow-properties-vendedorusername.md "undefined#/properties/vendedorUsername")

### vendedorUsername Type

`string`
