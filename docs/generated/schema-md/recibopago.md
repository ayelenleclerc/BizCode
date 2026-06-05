# ReciboPago Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReciboPagoListEnvelope.schema.json\*](../schema-json/ReciboPagoListEnvelope.schema.json "open original schema") |

## items Type

`object` ([ReciboPago](recibopago.md))

# items Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                             |
| :-------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [cbu](#cbu)                 | `string`  | Optional | cannot be null | [ReciboPago](recibopago-properties-cbu.md "undefined#/properties/cbu")                 |
| [createdAt](#createdat)     | `string`  | Required | cannot be null | [ReciboPago](recibopago-properties-createdat.md "undefined#/properties/createdAt")     |
| [estado](#estado)           | `string`  | Required | cannot be null | [ReciboPago](recibopago-properties-estado.md "undefined#/properties/estado")           |
| [facturas](#facturas)       | `array`   | Required | cannot be null | [ReciboPago](recibopago-properties-facturas.md "undefined#/properties/facturas")       |
| [fecha](#fecha)             | `string`  | Required | cannot be null | [ReciboPago](recibopago-properties-fecha.md "undefined#/properties/fecha")             |
| [id](#id)                   | `integer` | Required | cannot be null | [ReciboPago](recibopago-properties-id.md "undefined#/properties/id")                   |
| [metodoPago](#metodopago)   | `string`  | Required | cannot be null | [ReciboPago](recibopago-properties-metodopago.md "undefined#/properties/metodoPago")   |
| [notas](#notas)             | `string`  | Optional | cannot be null | [ReciboPago](recibopago-properties-notas.md "undefined#/properties/notas")             |
| [numero](#numero)           | `integer` | Required | cannot be null | [ReciboPago](recibopago-properties-numero.md "undefined#/properties/numero")           |
| [proveedor](#proveedor)     | `object`  | Required | cannot be null | [ReciboPago](recibopago-properties-proveedor.md "undefined#/properties/proveedor")     |
| [proveedorId](#proveedorid) | `integer` | Required | cannot be null | [ReciboPago](recibopago-properties-proveedorid.md "undefined#/properties/proveedorId") |
| [referencia](#referencia)   | `string`  | Optional | cannot be null | [ReciboPago](recibopago-properties-referencia.md "undefined#/properties/referencia")   |
| [total](#total)             | `string`  | Required | cannot be null | [ReciboPago](recibopago-properties-total.md "undefined#/properties/total")             |
| [usuario](#usuario)         | `object`  | Required | cannot be null | [ReciboPago](recibopago-properties-usuario.md "undefined#/properties/usuario")         |
| [usuarioId](#usuarioid)     | `integer` | Required | cannot be null | [ReciboPago](recibopago-properties-usuarioid.md "undefined#/properties/usuarioId")     |

## cbu



`cbu`

* is optional

* Type: `string`

* cannot be null

* defined in: [ReciboPago](recibopago-properties-cbu.md "undefined#/properties/cbu")

### cbu Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboPago](recibopago-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## estado



`estado`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboPago](recibopago-properties-estado.md "undefined#/properties/estado")

### estado Type

`string`

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"emitido"` |             |
| `"anulado"` |             |

## facturas



`facturas`

* is required

* Type: `object[]` ([ReciboPagoFactura](recibopagofactura.md))

* cannot be null

* defined in: [ReciboPago](recibopago-properties-facturas.md "undefined#/properties/facturas")

### facturas Type

`object[]` ([ReciboPagoFactura](recibopagofactura.md))

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboPago](recibopago-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReciboPago](recibopago-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## metodoPago



`metodoPago`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboPago](recibopago-properties-metodopago.md "undefined#/properties/metodoPago")

### metodoPago Type

`string`

### metodoPago Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value             | Explanation |
| :---------------- | :---------- |
| `"transferencia"` |             |
| `"cheque"`        |             |
| `"efectivo"`      |             |
| `"echeq"`         |             |

## notas



`notas`

* is optional

* Type: `string`

* cannot be null

* defined in: [ReciboPago](recibopago-properties-notas.md "undefined#/properties/notas")

### notas Type

`string`

## numero



`numero`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReciboPago](recibopago-properties-numero.md "undefined#/properties/numero")

### numero Type

`integer`

## proveedor



`proveedor`

* is required

* Type: `object` ([Details](recibopago-properties-proveedor.md))

* cannot be null

* defined in: [ReciboPago](recibopago-properties-proveedor.md "undefined#/properties/proveedor")

### proveedor Type

`object` ([Details](recibopago-properties-proveedor.md))

## proveedorId



`proveedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReciboPago](recibopago-properties-proveedorid.md "undefined#/properties/proveedorId")

### proveedorId Type

`integer`

## referencia



`referencia`

* is optional

* Type: `string`

* cannot be null

* defined in: [ReciboPago](recibopago-properties-referencia.md "undefined#/properties/referencia")

### referencia Type

`string`

## total



`total`

* is required

* Type: `string`

* cannot be null

* defined in: [ReciboPago](recibopago-properties-total.md "undefined#/properties/total")

### total Type

`string`

## usuario



`usuario`

* is required

* Type: `object` ([Details](recibopago-properties-usuario.md))

* cannot be null

* defined in: [ReciboPago](recibopago-properties-usuario.md "undefined#/properties/usuario")

### usuario Type

`object` ([Details](recibopago-properties-usuario.md))

## usuarioId



`usuarioId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ReciboPago](recibopago-properties-usuarioid.md "undefined#/properties/usuarioId")

### usuarioId Type

`integer`
