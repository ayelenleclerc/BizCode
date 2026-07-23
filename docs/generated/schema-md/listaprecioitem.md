# ListaPrecioItem Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ListaPrecioItemEnvelope.schema.json\*](../schema-json/ListaPrecioItemEnvelope.schema.json "open original schema") |

## data Type

`object` ([ListaPrecioItem](listaprecioitem.md))

# data Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [articuloId](#articuloid)       | `integer` | Optional | cannot be null | [ListaPrecioItem](listaprecioitem-properties-articuloid.md "undefined#/properties/articuloId")       |
| [escalonados](#escalonados)     | `array`   | Optional | cannot be null | [ListaPrecioItem](listaprecioitem-properties-escalonados.md "undefined#/properties/escalonados")     |
| [id](#id)                       | `integer` | Optional | cannot be null | [ListaPrecioItem](listaprecioitem-properties-id.md "undefined#/properties/id")                       |
| [listaPrecioId](#listaprecioid) | `integer` | Optional | cannot be null | [ListaPrecioItem](listaprecioitem-properties-listaprecioid.md "undefined#/properties/listaPrecioId") |
| [porcentaje](#porcentaje)       | `number`  | Optional | cannot be null | [ListaPrecioItem](listaprecioitem-properties-porcentaje.md "undefined#/properties/porcentaje")       |
| [precio](#precio)               | `number`  | Optional | cannot be null | [ListaPrecioItem](listaprecioitem-properties-precio.md "undefined#/properties/precio")               |
| [tenantId](#tenantid)           | `integer` | Optional | cannot be null | [ListaPrecioItem](listaprecioitem-properties-tenantid.md "undefined#/properties/tenantId")           |
| [tipoPrecio](#tipoprecio)       | `string`  | Optional | cannot be null | [ListaPrecioItem](listaprecioitem-properties-tipoprecio.md "undefined#/properties/tipoPrecio")       |
| Additional Properties           | Any       | Optional | can be null    |                                                                                                      |

## articuloId



`articuloId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ListaPrecioItem](listaprecioitem-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## escalonados



`escalonados`

* is optional

* Type: `object[]` ([PrecioEscalonado](precioescalonado.md))

* cannot be null

* defined in: [ListaPrecioItem](listaprecioitem-properties-escalonados.md "undefined#/properties/escalonados")

### escalonados Type

`object[]` ([PrecioEscalonado](precioescalonado.md))

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ListaPrecioItem](listaprecioitem-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## listaPrecioId



`listaPrecioId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ListaPrecioItem](listaprecioitem-properties-listaprecioid.md "undefined#/properties/listaPrecioId")

### listaPrecioId Type

`integer`

## porcentaje



`porcentaje`

* is optional

* Type: `number`

* cannot be null

* defined in: [ListaPrecioItem](listaprecioitem-properties-porcentaje.md "undefined#/properties/porcentaje")

### porcentaje Type

`number`

## precio



`precio`

* is optional

* Type: `number`

* cannot be null

* defined in: [ListaPrecioItem](listaprecioitem-properties-precio.md "undefined#/properties/precio")

### precio Type

`number`

## tenantId



`tenantId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ListaPrecioItem](listaprecioitem-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tipoPrecio



`tipoPrecio`

* is optional

* Type: `string`

* cannot be null

* defined in: [ListaPrecioItem](listaprecioitem-properties-tipoprecio.md "undefined#/properties/tipoPrecio")

### tipoPrecio Type

`string`

### tipoPrecio Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                     | Explanation |
| :------------------------ | :---------- |
| `"fijo"`                  |             |
| `"porcentaje_sobre_base"` |             |

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
