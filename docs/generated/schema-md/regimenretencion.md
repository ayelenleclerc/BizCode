# RegimenRetencion Schema

```txt
undefined#/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RegimenRetencionListEnvelope.schema.json\*](../schema-json/RegimenRetencionListEnvelope.schema.json "open original schema") |

## items Type

`object` ([RegimenRetencion](regimenretencion.md))

# items Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                         |
| :-------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [activo](#activo)           | `boolean` | Required | cannot be null | [RegimenRetencion](regimenretencion-properties-activo.md "undefined#/properties/activo")           |
| [alicuota](#alicuota)       | `string`  | Required | cannot be null | [RegimenRetencion](regimenretencion-properties-alicuota.md "undefined#/properties/alicuota")       |
| [alicuotaMin](#alicuotamin) | `string`  | Required | can be null    | [RegimenRetencion](regimenretencion-properties-alicuotamin.md "undefined#/properties/alicuotaMin") |
| [createdAt](#createdat)     | `string`  | Required | cannot be null | [RegimenRetencion](regimenretencion-properties-createdat.md "undefined#/properties/createdAt")     |
| [id](#id)                   | `integer` | Required | cannot be null | [RegimenRetencion](regimenretencion-properties-id.md "undefined#/properties/id")                   |
| [nombre](#nombre)           | `string`  | Required | cannot be null | [RegimenRetencion](regimenretencion-properties-nombre.md "undefined#/properties/nombre")           |
| [provincia](#provincia)     | `string`  | Required | can be null    | [RegimenRetencion](regimenretencion-properties-provincia.md "undefined#/properties/provincia")     |
| [subtipo](#subtipo)         | `string`  | Required | cannot be null | [RegimenRetencion](regimenretencion-properties-subtipo.md "undefined#/properties/subtipo")         |
| [tenantId](#tenantid)       | `integer` | Required | cannot be null | [RegimenRetencion](regimenretencion-properties-tenantid.md "undefined#/properties/tenantId")       |
| [tipo](#tipo)               | `string`  | Required | cannot be null | [RegimenRetencion](regimenretencion-properties-tipo.md "undefined#/properties/tipo")               |
| [updatedAt](#updatedat)     | `string`  | Required | cannot be null | [RegimenRetencion](regimenretencion-properties-updatedat.md "undefined#/properties/updatedAt")     |

## activo



`activo`

* is required

* Type: `boolean`

* cannot be null

* defined in: [RegimenRetencion](regimenretencion-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## alicuota



`alicuota`

* is required

* Type: `string`

* cannot be null

* defined in: [RegimenRetencion](regimenretencion-properties-alicuota.md "undefined#/properties/alicuota")

### alicuota Type

`string`

## alicuotaMin



`alicuotaMin`

* is required

* Type: `string`

* can be null

* defined in: [RegimenRetencion](regimenretencion-properties-alicuotamin.md "undefined#/properties/alicuotaMin")

### alicuotaMin Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [RegimenRetencion](regimenretencion-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [RegimenRetencion](regimenretencion-properties-id.md "undefined#/properties/id")

### id Type

`integer`

### id Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [RegimenRetencion](regimenretencion-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

## provincia



`provincia`

* is required

* Type: `string`

* can be null

* defined in: [RegimenRetencion](regimenretencion-properties-provincia.md "undefined#/properties/provincia")

### provincia Type

`string`

## subtipo



`subtipo`

* is required

* Type: `string`

* cannot be null

* defined in: [RegimenRetencion](regimenretencion-properties-subtipo.md "undefined#/properties/subtipo")

### subtipo Type

`string`

### subtipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value          | Explanation |
| :------------- | :---------- |
| `"retencion"`  |             |
| `"percepcion"` |             |

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [RegimenRetencion](regimenretencion-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

### tenantId Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [RegimenRetencion](regimenretencion-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value         | Explanation |
| :------------ | :---------- |
| `"ganancias"` |             |
| `"iva"`       |             |
| `"iibb"`      |             |

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [RegimenRetencion](regimenretencion-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
