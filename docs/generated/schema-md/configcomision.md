# ConfigComision Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConfigComisionListEnvelope.schema.json\*](../schema-json/ConfigComisionListEnvelope.schema.json "open original schema") |

## items Type

`object` ([ConfigComision](configcomision.md))

# items Properties

| Property                                    | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [alicuota](#alicuota)                       | `number`  | Required | cannot be null | [ConfigComision](configcomision-properties-alicuota.md "undefined#/properties/alicuota")                       |
| [articuloCategoriaId](#articulocategoriaid) | `integer` | Required | cannot be null | [ConfigComision](configcomision-properties-articulocategoriaid.md "undefined#/properties/articuloCategoriaId") |
| [clienteId](#clienteid)                     | `integer` | Required | cannot be null | [ConfigComision](configcomision-properties-clienteid.md "undefined#/properties/clienteId")                     |
| [createdAt](#createdat)                     | `string`  | Required | cannot be null | [ConfigComision](configcomision-properties-createdat.md "undefined#/properties/createdAt")                     |
| [id](#id)                                   | `integer` | Required | cannot be null | [ConfigComision](configcomision-properties-id.md "undefined#/properties/id")                                   |
| [tenantId](#tenantid)                       | `integer` | Required | cannot be null | [ConfigComision](configcomision-properties-tenantid.md "undefined#/properties/tenantId")                       |
| [tipo](#tipo)                               | `string`  | Required | cannot be null | [ConfigComision](comisiontipo.md "undefined#/properties/tipo")                                                 |
| [updatedAt](#updatedat)                     | `string`  | Required | cannot be null | [ConfigComision](configcomision-properties-updatedat.md "undefined#/properties/updatedAt")                     |
| [vendedorId](#vendedorid)                   | `integer` | Required | cannot be null | [ConfigComision](configcomision-properties-vendedorid.md "undefined#/properties/vendedorId")                   |
| [vendedorUsername](#vendedorusername)       | `string`  | Optional | cannot be null | [ConfigComision](configcomision-properties-vendedorusername.md "undefined#/properties/vendedorUsername")       |
| [vigenciaDesde](#vigenciadesde)             | `string`  | Required | cannot be null | [ConfigComision](configcomision-properties-vigenciadesde.md "undefined#/properties/vigenciaDesde")             |
| [vigenciaHasta](#vigenciahasta)             | `string`  | Required | cannot be null | [ConfigComision](configcomision-properties-vigenciahasta.md "undefined#/properties/vigenciaHasta")             |

## alicuota



`alicuota`

* is required

* Type: `number`

* cannot be null

* defined in: [ConfigComision](configcomision-properties-alicuota.md "undefined#/properties/alicuota")

### alicuota Type

`number`

## articuloCategoriaId



`articuloCategoriaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigComision](configcomision-properties-articulocategoriaid.md "undefined#/properties/articuloCategoriaId")

### articuloCategoriaId Type

`integer`

## clienteId



`clienteId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigComision](configcomision-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ConfigComision](configcomision-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigComision](configcomision-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigComision](configcomision-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tipo



`tipo`

* is required

* Type: `string` ([ComisionTipo](comisiontipo.md))

* cannot be null

* defined in: [ConfigComision](comisiontipo.md "undefined#/properties/tipo")

### tipo Type

`string` ([ComisionTipo](comisiontipo.md))

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                      | Explanation |
| :------------------------- | :---------- |
| `"porcentaje_cobrado"`     |             |
| `"porcentaje_facturado"`   |             |
| `"importe_fijo_por_venta"` |             |

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [ConfigComision](configcomision-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## vendedorId



`vendedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigComision](configcomision-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`

## vendedorUsername



`vendedorUsername`

* is optional

* Type: `string`

* cannot be null

* defined in: [ConfigComision](configcomision-properties-vendedorusername.md "undefined#/properties/vendedorUsername")

### vendedorUsername Type

`string`

## vigenciaDesde



`vigenciaDesde`

* is required

* Type: `string`

* cannot be null

* defined in: [ConfigComision](configcomision-properties-vigenciadesde.md "undefined#/properties/vigenciaDesde")

### vigenciaDesde Type

`string`

### vigenciaDesde Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## vigenciaHasta



`vigenciaHasta`

* is required

* Type: `string`

* cannot be null

* defined in: [ConfigComision](configcomision-properties-vigenciahasta.md "undefined#/properties/vigenciaHasta")

### vigenciaHasta Type

`string`

### vigenciaHasta Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
