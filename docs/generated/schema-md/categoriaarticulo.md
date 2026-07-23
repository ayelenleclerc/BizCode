# CategoriaArticulo Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CategoriaArticuloListEnvelope.schema.json\*](../schema-json/CategoriaArticuloListEnvelope.schema.json "open original schema") |

## items Type

`object` ([CategoriaArticulo](categoriaarticulo.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                               |
| :------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------- |
| [activo](#activo)               | `boolean` | Required | cannot be null | [CategoriaArticulo](categoriaarticulo-properties-activo.md "undefined#/properties/activo")               |
| [codigo](#codigo)               | `string`  | Optional | cannot be null | [CategoriaArticulo](categoriaarticulo-properties-codigo.md "undefined#/properties/codigo")               |
| [createdAt](#createdat)         | `string`  | Required | cannot be null | [CategoriaArticulo](categoriaarticulo-properties-createdat.md "undefined#/properties/createdAt")         |
| [id](#id)                       | `integer` | Required | cannot be null | [CategoriaArticulo](categoriaarticulo-properties-id.md "undefined#/properties/id")                       |
| [nombre](#nombre)               | `string`  | Required | cannot be null | [CategoriaArticulo](categoriaarticulo-properties-nombre.md "undefined#/properties/nombre")               |
| [padreId](#padreid)             | `integer` | Required | cannot be null | [CategoriaArticulo](categoriaarticulo-properties-padreid.md "undefined#/properties/padreId")             |
| [precioDefault](#preciodefault) | `number`  | Required | cannot be null | [CategoriaArticulo](categoriaarticulo-properties-preciodefault.md "undefined#/properties/precioDefault") |
| [tenantId](#tenantid)           | `integer` | Required | cannot be null | [CategoriaArticulo](categoriaarticulo-properties-tenantid.md "undefined#/properties/tenantId")           |
| [updatedAt](#updatedat)         | `string`  | Required | cannot be null | [CategoriaArticulo](categoriaarticulo-properties-updatedat.md "undefined#/properties/updatedAt")         |

## activo



`activo`

* is required

* Type: `boolean`

* cannot be null

* defined in: [CategoriaArticulo](categoriaarticulo-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## codigo



`codigo`

* is optional

* Type: `string`

* cannot be null

* defined in: [CategoriaArticulo](categoriaarticulo-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [CategoriaArticulo](categoriaarticulo-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [CategoriaArticulo](categoriaarticulo-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [CategoriaArticulo](categoriaarticulo-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

## padreId



`padreId`

* is required

* Type: `integer`

* cannot be null

* defined in: [CategoriaArticulo](categoriaarticulo-properties-padreid.md "undefined#/properties/padreId")

### padreId Type

`integer`

## precioDefault



`precioDefault`

* is required

* Type: `number`

* cannot be null

* defined in: [CategoriaArticulo](categoriaarticulo-properties-preciodefault.md "undefined#/properties/precioDefault")

### precioDefault Type

`number`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [CategoriaArticulo](categoriaarticulo-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [CategoriaArticulo](categoriaarticulo-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
