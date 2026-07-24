# ClientePuntosDetail Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ClientePuntosEnvelope.schema.json\*](../schema-json/ClientePuntosEnvelope.schema.json "open original schema") |

## data Type

`object` ([ClientePuntosDetail](clientepuntosdetail.md))

# data Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                                           |
| :-------------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)                 | `integer` | Required | cannot be null | [ClientePuntosDetail](clientepuntosdetail-properties-clienteid.md "undefined#/properties/clienteId")                 |
| [equivalenteDinero](#equivalentedinero) | `number`  | Required | cannot be null | [ClientePuntosDetail](clientepuntosdetail-properties-equivalentedinero.md "undefined#/properties/equivalenteDinero") |
| [movimientos](#movimientos)             | `array`   | Required | cannot be null | [ClientePuntosDetail](clientepuntosdetail-properties-movimientos.md "undefined#/properties/movimientos")             |
| [puntos](#puntos)                       | `integer` | Required | cannot be null | [ClientePuntosDetail](clientepuntosdetail-properties-puntos.md "undefined#/properties/puntos")                       |
| [totalMovimientos](#totalmovimientos)   | `integer` | Required | cannot be null | [ClientePuntosDetail](clientepuntosdetail-properties-totalmovimientos.md "undefined#/properties/totalMovimientos")   |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ClientePuntosDetail](clientepuntosdetail-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## equivalenteDinero



`equivalenteDinero`

* is required

* Type: `number`

* cannot be null

* defined in: [ClientePuntosDetail](clientepuntosdetail-properties-equivalentedinero.md "undefined#/properties/equivalenteDinero")

### equivalenteDinero Type

`number`

## movimientos



`movimientos`

* is required

* Type: `object[]` ([MovimientoPuntos](movimientopuntos.md))

* cannot be null

* defined in: [ClientePuntosDetail](clientepuntosdetail-properties-movimientos.md "undefined#/properties/movimientos")

### movimientos Type

`object[]` ([MovimientoPuntos](movimientopuntos.md))

## puntos



`puntos`

* is required

* Type: `integer`

* cannot be null

* defined in: [ClientePuntosDetail](clientepuntosdetail-properties-puntos.md "undefined#/properties/puntos")

### puntos Type

`integer`

## totalMovimientos



`totalMovimientos`

* is required

* Type: `integer`

* cannot be null

* defined in: [ClientePuntosDetail](clientepuntosdetail-properties-totalmovimientos.md "undefined#/properties/totalMovimientos")

### totalMovimientos Type

`integer`
