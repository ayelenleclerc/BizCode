# Deposito Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DepositoListEnvelope.schema.json\*](../schema-json/DepositoListEnvelope.schema.json "open original schema") |

## items Type

`object` ([Deposito](deposito.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                             |
| :------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------- |
| [activo](#activo)               | `boolean` | Required | cannot be null | [Deposito](deposito-properties-activo.md "undefined#/properties/activo")               |
| [codigo](#codigo)               | `string`  | Required | cannot be null | [Deposito](deposito-properties-codigo.md "undefined#/properties/codigo")               |
| [createdAt](#createdat)         | `string`  | Required | cannot be null | [Deposito](deposito-properties-createdat.md "undefined#/properties/createdAt")         |
| [direccion](#direccion)         | `string`  | Required | cannot be null | [Deposito](deposito-properties-direccion.md "undefined#/properties/direccion")         |
| [esDefault](#esdefault)         | `boolean` | Required | cannot be null | [Deposito](deposito-properties-esdefault.md "undefined#/properties/esDefault")         |
| [id](#id)                       | `integer` | Required | cannot be null | [Deposito](deposito-properties-id.md "undefined#/properties/id")                       |
| [nombre](#nombre)               | `string`  | Required | cannot be null | [Deposito](deposito-properties-nombre.md "undefined#/properties/nombre")               |
| [responsableId](#responsableid) | `integer` | Required | cannot be null | [Deposito](deposito-properties-responsableid.md "undefined#/properties/responsableId") |
| [tenantId](#tenantid)           | `integer` | Required | cannot be null | [Deposito](deposito-properties-tenantid.md "undefined#/properties/tenantId")           |
| [tipo](#tipo)                   | `string`  | Required | cannot be null | [Deposito](deposito-properties-tipo.md "undefined#/properties/tipo")                   |
| [updatedAt](#updatedat)         | `string`  | Required | cannot be null | [Deposito](deposito-properties-updatedat.md "undefined#/properties/updatedAt")         |

## activo



`activo`

* is required

* Type: `boolean`

* cannot be null

* defined in: [Deposito](deposito-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## codigo



`codigo`

* is required

* Type: `string`

* cannot be null

* defined in: [Deposito](deposito-properties-codigo.md "undefined#/properties/codigo")

### codigo Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [Deposito](deposito-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## direccion



`direccion`

* is required

* Type: `string`

* cannot be null

* defined in: [Deposito](deposito-properties-direccion.md "undefined#/properties/direccion")

### direccion Type

`string`

## esDefault



`esDefault`

* is required

* Type: `boolean`

* cannot be null

* defined in: [Deposito](deposito-properties-esdefault.md "undefined#/properties/esDefault")

### esDefault Type

`boolean`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [Deposito](deposito-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [Deposito](deposito-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

## responsableId



`responsableId`

* is required

* Type: `integer`

* cannot be null

* defined in: [Deposito](deposito-properties-responsableid.md "undefined#/properties/responsableId")

### responsableId Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [Deposito](deposito-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## tipo



`tipo`

* is required

* Type: `string`

* cannot be null

* defined in: [Deposito](deposito-properties-tipo.md "undefined#/properties/tipo")

### tipo Type

`string`

### tipo Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"central"`  |             |
| `"sucursal"` |             |
| `"externo"`  |             |
| `"picking"`  |             |
| `"transito"` |             |

## updatedAt



`updatedAt`

* is required

* Type: `string`

* cannot be null

* defined in: [Deposito](deposito-properties-updatedat.md "undefined#/properties/updatedAt")

### updatedAt Type

`string`

### updatedAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
