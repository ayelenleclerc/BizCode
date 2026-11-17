# VentaConOS Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VentaConOSListEnvelope.schema.json\*](../schema-json/VentaConOSListEnvelope.schema.json "open original schema") |

## items Type

`object` ([VentaConOS](ventaconos.md))

# items Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                   |
| :-------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [clienteId](#clienteid)           | `integer` | Required | cannot be null | [VentaConOS](ventaconos-properties-clienteid.md "undefined#/properties/clienteId")           |
| [copagoPaciente](#copagopaciente) | `number`  | Required | cannot be null | [VentaConOS](ventaconos-properties-copagopaciente.md "undefined#/properties/copagoPaciente") |
| [createdAt](#createdat)           | `string`  | Required | cannot be null | [VentaConOS](ventaconos-properties-createdat.md "undefined#/properties/createdAt")           |
| [creditoOS](#creditoos)           | `number`  | Required | cannot be null | [VentaConOS](ventaconos-properties-creditoos.md "undefined#/properties/creditoOS")           |
| [estado](#estado)                 | `string`  | Required | cannot be null | [VentaConOS](ventaosestado.md "undefined#/properties/estado")                                |
| [facturaId](#facturaid)           | `integer` | Required | cannot be null | [VentaConOS](ventaconos-properties-facturaid.md "undefined#/properties/facturaId")           |
| [fecha](#fecha)                   | `string`  | Required | cannot be null | [VentaConOS](ventaconos-properties-fecha.md "undefined#/properties/fecha")                   |
| [id](#id)                         | `integer` | Required | cannot be null | [VentaConOS](ventaconos-properties-id.md "undefined#/properties/id")                         |
| [items](#items)                   | `array`   | Optional | cannot be null | [VentaConOS](ventaconos-properties-items.md "undefined#/properties/items")                   |
| [nroAfiliado](#nroafiliado)       | `string`  | Required | cannot be null | [VentaConOS](ventaconos-properties-nroafiliado.md "undefined#/properties/nroAfiliado")       |
| [nroReceta](#nroreceta)           | `string`  | Required | cannot be null | [VentaConOS](ventaconos-properties-nroreceta.md "undefined#/properties/nroReceta")           |
| [obraSocialId](#obrasocialid)     | `integer` | Required | cannot be null | [VentaConOS](ventaconos-properties-obrasocialid.md "undefined#/properties/obraSocialId")     |
| [presentacionId](#presentacionid) | `integer` | Required | cannot be null | [VentaConOS](ventaconos-properties-presentacionid.md "undefined#/properties/presentacionId") |
| [tenantId](#tenantid)             | `integer` | Required | cannot be null | [VentaConOS](ventaconos-properties-tenantid.md "undefined#/properties/tenantId")             |
| [totalVenta](#totalventa)         | `number`  | Required | cannot be null | [VentaConOS](ventaconos-properties-totalventa.md "undefined#/properties/totalVenta")         |
| [updatedAt](#updatedat)           | `string`  | Required | cannot be null | [VentaConOS](ventaconos-properties-updatedat.md "undefined#/properties/updatedAt")           |

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VentaConOS](ventaconos-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## copagoPaciente



`copagoPaciente`

* is required

* Type: `number`

* cannot be null

* defined in: [VentaConOS](ventaconos-properties-copagopaciente.md "undefined#/properties/copagoPaciente")

### copagoPaciente Type

`number`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [VentaConOS](ventaconos-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## creditoOS



`creditoOS`

* is required

* Type: `number`

* cannot be null

* defined in: [VentaConOS](ventaconos-properties-creditoos.md "undefined#/properties/creditoOS")

### creditoOS Type

`number`

## estado



`estado`

* is required

* Type: `string` ([VentaOsEstado](ventaosestado.md))

* cannot be null

* defined in: [VentaConOS](ventaosestado.md "undefined#/properties/estado")

### estado Type

`string` ([VentaOsEstado](ventaosestado.md))

### estado Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                  | Explanation |
| :--------------------- | :---------- |
| `"pendiente_cobro_os"` |             |
| `"presentado"`         |             |
| `"cobrado"`            |             |
| `"rechazado_os"`       |             |

## facturaId



`facturaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VentaConOS](ventaconos-properties-facturaid.md "undefined#/properties/facturaId")

### facturaId Type

`integer`

## fecha



`fecha`

* is required

* Type: `string`

* cannot be null

* defined in: [VentaConOS](ventaconos-properties-fecha.md "undefined#/properties/fecha")

### fecha Type

`string`

### fecha Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [VentaConOS](ventaconos-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## items



`items`

* is optional

* Type: `object[]` ([VentaOSItem](ventaositem.md))

* cannot be null

* defined in: [VentaConOS](ventaconos-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([VentaOSItem](ventaositem.md))

## nroAfiliado



`nroAfiliado`

* is required

* Type: `string`

* cannot be null

* defined in: [VentaConOS](ventaconos-properties-nroafiliado.md "undefined#/properties/nroAfiliado")

### nroAfiliado Type

`string`

## nroReceta



`nroReceta`

* is required

* Type: `string`

* cannot be null

* defined in: [VentaConOS](ventaconos-properties-nroreceta.md "undefined#/properties/nroReceta")

### nroReceta Type

`string`

## obraSocialId



`obraSocialId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VentaConOS](ventaconos-properties-obrasocialid.md "undefined#/properties/obraSocialId")

### obraSocialId Type

`integer`

## presentacionId



`presentacionId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VentaConOS](ventaconos-properties-presentacionid.md "undefined#/properties/presentacionId")

### presentacionId Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VentaConOS](ventaconos-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## totalVenta



`totalVenta`

* is required

* Type: `number`

* cannot be null

* defined in: [VentaConOS](ventaconos-properties-totalventa.md "undefined#/properties/totalVenta")

### totalVenta Type

`number`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [VentaConOS](ventaconos-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
