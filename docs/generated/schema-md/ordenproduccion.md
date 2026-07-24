# OrdenProduccion Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [OrdenProduccionListEnvelope.schema.json\*](../schema-json/OrdenProduccionListEnvelope.schema.json "open original schema") |

## items Type

`object` ([OrdenProduccion](ordenproduccion.md))

# items Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                             |
| :-------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [articulo](#articulo)             | `object`  | Optional | cannot be null | [OrdenProduccion](ordenproduccion-properties-articulo.md "undefined#/properties/articulo")             |
| [articuloId](#articuloid)         | `integer` | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-articuloid.md "undefined#/properties/articuloId")         |
| [cantidadPlanif](#cantidadplanif) | `number`  | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-cantidadplanif.md "undefined#/properties/cantidadPlanif") |
| [cantidadReal](#cantidadreal)     | `number`  | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-cantidadreal.md "undefined#/properties/cantidadReal")     |
| [costoTotal](#costototal)         | `number`  | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-costototal.md "undefined#/properties/costoTotal")         |
| [createdAt](#createdat)           | `string`  | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-createdat.md "undefined#/properties/createdAt")           |
| [deposito](#deposito)             | `object`  | Optional | cannot be null | [OrdenProduccion](ordenproduccion-properties-deposito.md "undefined#/properties/deposito")             |
| [depositoId](#depositoid)         | `integer` | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-depositoid.md "undefined#/properties/depositoId")         |
| [estado](#estado)                 | `string`  | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-estado.md "undefined#/properties/estado")                 |
| [fechaFin](#fechafin)             | `string`  | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-fechafin.md "undefined#/properties/fechaFin")             |
| [fechaInicio](#fechainicio)       | `string`  | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-fechainicio.md "undefined#/properties/fechaInicio")       |
| [fechaPlanif](#fechaplanif)       | `string`  | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-fechaplanif.md "undefined#/properties/fechaPlanif")       |
| [formula](#formula)               | `object`  | Optional | cannot be null | [OrdenProduccion](ordenproduccion-properties-formula.md "undefined#/properties/formula")               |
| [formulaId](#formulaid)           | `integer` | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-formulaid.md "undefined#/properties/formulaId")           |
| [id](#id)                         | `integer` | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-id.md "undefined#/properties/id")                         |
| [insumos](#insumos)               | `array`   | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-insumos.md "undefined#/properties/insumos")               |
| [numero](#numero)                 | `integer` | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-numero.md "undefined#/properties/numero")                 |
| [observaciones](#observaciones)   | `string`  | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-observaciones.md "undefined#/properties/observaciones")   |
| [operadorId](#operadorid)         | `integer` | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-operadorid.md "undefined#/properties/operadorId")         |
| [tenantId](#tenantid)             | `integer` | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-tenantid.md "undefined#/properties/tenantId")             |
| [updatedAt](#updatedat)           | `string`  | Required | cannot be null | [OrdenProduccion](ordenproduccion-properties-updatedat.md "undefined#/properties/updatedAt")           |

## articulo



`articulo`

* is optional

* Type: `object` ([Details](ordenproduccion-properties-articulo.md))

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-articulo.md "undefined#/properties/articulo")

### articulo Type

`object` ([Details](ordenproduccion-properties-articulo.md))

## articuloId



`articuloId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-articuloid.md "undefined#/properties/articuloId")

### articuloId Type

`integer`

## cantidadPlanif



`cantidadPlanif`

* is required

* Type: `number`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-cantidadplanif.md "undefined#/properties/cantidadPlanif")

### cantidadPlanif Type

`number`

## cantidadReal



`cantidadReal`

* is required

* Type: `number`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-cantidadreal.md "undefined#/properties/cantidadReal")

### cantidadReal Type

`number`

## costoTotal



`costoTotal`

* is required

* Type: `number`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-costototal.md "undefined#/properties/costoTotal")

### costoTotal Type

`number`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## deposito



`deposito`

* is optional

* Type: `object` ([Details](ordenproduccion-properties-deposito.md))

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-deposito.md "undefined#/properties/deposito")

### deposito Type

`object` ([Details](ordenproduccion-properties-deposito.md))

## depositoId



`depositoId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-depositoid.md "undefined#/properties/depositoId")

### depositoId Type

`integer`

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"planificada"` |             |
| `"en_proceso"`  |             |
| `"completada"`  |             |
| `"cancelada"`   |             |

## fechaFin



`fechaFin`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-fechafin.md "undefined#/properties/fechaFin")

### fechaFin Type

`string`

### fechaFin Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fechaInicio



`fechaInicio`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-fechainicio.md "undefined#/properties/fechaInicio")

### fechaInicio Type

`string`

### fechaInicio Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## fechaPlanif



`fechaPlanif`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-fechaplanif.md "undefined#/properties/fechaPlanif")

### fechaPlanif Type

`string`

### fechaPlanif Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## formula



`formula`

* is optional

* Type: `object` ([Details](ordenproduccion-properties-formula.md))

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-formula.md "undefined#/properties/formula")

### formula Type

`object` ([Details](ordenproduccion-properties-formula.md))

## formulaId



`formulaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-formulaid.md "undefined#/properties/formulaId")

### formulaId Type

`integer`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## insumos



`insumos`

* is required

* Type: `object[]` ([Details](ordenproduccion-properties-insumos-items.md))

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-insumos.md "undefined#/properties/insumos")

### insumos Type

`object[]` ([Details](ordenproduccion-properties-insumos-items.md))

## numero



`numero`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-numero.md "undefined#/properties/numero")

### numero Type

`integer`

## observaciones



`observaciones`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-observaciones.md "undefined#/properties/observaciones")

### observaciones Type

`string`

## operadorId



`operadorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-operadorid.md "undefined#/properties/operadorId")

### operadorId Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [OrdenProduccion](ordenproduccion-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
