# ConfigComisionPatchInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConfigComisionPatchInput.schema.json](../schema-json/ConfigComisionPatchInput.schema.json "open original schema") |

## ConfigComisionPatchInput Type

`object` ([ConfigComisionPatchInput](configcomisionpatchinput.md))

# ConfigComisionPatchInput Properties

| Property                                    | Type      | Required | Nullable       | Defined by                                                                                                                         |
| :------------------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| [alicuota](#alicuota)                       | `number`  | Optional | cannot be null | [ConfigComisionPatchInput](configcomisionpatchinput-properties-alicuota.md "undefined#/properties/alicuota")                       |
| [articuloCategoriaId](#articulocategoriaid) | `integer` | Optional | cannot be null | [ConfigComisionPatchInput](configcomisionpatchinput-properties-articulocategoriaid.md "undefined#/properties/articuloCategoriaId") |
| [clienteId](#clienteid)                     | `integer` | Optional | cannot be null | [ConfigComisionPatchInput](configcomisionpatchinput-properties-clienteid.md "undefined#/properties/clienteId")                     |
| [tipo](#tipo)                               | `string`  | Optional | cannot be null | [ConfigComisionPatchInput](comisiontipo.md "undefined#/properties/tipo")                                                           |
| [vendedorId](#vendedorid)                   | `integer` | Optional | cannot be null | [ConfigComisionPatchInput](configcomisionpatchinput-properties-vendedorid.md "undefined#/properties/vendedorId")                   |
| [vigenciaDesde](#vigenciadesde)             | `string`  | Optional | cannot be null | [ConfigComisionPatchInput](configcomisionpatchinput-properties-vigenciadesde.md "undefined#/properties/vigenciaDesde")             |
| [vigenciaHasta](#vigenciahasta)             | `string`  | Optional | cannot be null | [ConfigComisionPatchInput](configcomisionpatchinput-properties-vigenciahasta.md "undefined#/properties/vigenciaHasta")             |

## alicuota



`alicuota`

* is optional

* Type: `number`

* cannot be null

* defined in: [ConfigComisionPatchInput](configcomisionpatchinput-properties-alicuota.md "undefined#/properties/alicuota")

### alicuota Type

`number`

### alicuota Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## articuloCategoriaId



`articuloCategoriaId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ConfigComisionPatchInput](configcomisionpatchinput-properties-articulocategoriaid.md "undefined#/properties/articuloCategoriaId")

### articuloCategoriaId Type

`integer`

### articuloCategoriaId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## clienteId



`clienteId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ConfigComisionPatchInput](configcomisionpatchinput-properties-clienteid.md "undefined#/properties/clienteId")

### clienteId Type

`integer`

### clienteId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## tipo



`tipo`

* is optional

* Type: `string` ([ComisionTipo](comisiontipo.md))

* cannot be null

* defined in: [ConfigComisionPatchInput](comisiontipo.md "undefined#/properties/tipo")

### tipo Type

`string` ([ComisionTipo](comisiontipo.md))

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value                      | Explanation |
| :------------------------- | :---------- |
| `"porcentaje_cobrado"`     |             |
| `"porcentaje_facturado"`   |             |
| `"importe_fijo_por_venta"` |             |

## vendedorId



`vendedorId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ConfigComisionPatchInput](configcomisionpatchinput-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`

### vendedorId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## vigenciaDesde



`vigenciaDesde`

* is optional

* Type: `string`

* cannot be null

* defined in: [ConfigComisionPatchInput](configcomisionpatchinput-properties-vigenciadesde.md "undefined#/properties/vigenciaDesde")

### vigenciaDesde Type

`string`

### vigenciaDesde Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## vigenciaHasta



`vigenciaHasta`

* is optional

* Type: `string`

* cannot be null

* defined in: [ConfigComisionPatchInput](configcomisionpatchinput-properties-vigenciahasta.md "undefined#/properties/vigenciaHasta")

### vigenciaHasta Type

`string`

### vigenciaHasta Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
