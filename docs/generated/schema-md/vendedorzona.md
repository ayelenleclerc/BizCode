# VendedorZona Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [VendedorZonaListEnvelope.schema.json\*](../schema-json/VendedorZonaListEnvelope.schema.json "open original schema") |

## items Type

`object` ([VendedorZona](vendedorzona.md))

# items Properties

| Property                          | Type      | Required | Nullable       | Defined by                                                                                       |
| :-------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [createdAt](#createdat)           | `string`  | Required | cannot be null | [VendedorZona](vendedorzona-properties-createdat.md "undefined#/properties/createdAt")           |
| [deliveryZone](#deliveryzone)     | `object`  | Optional | cannot be null | [VendedorZona](vendedorzona-properties-deliveryzone.md "undefined#/properties/deliveryZone")     |
| [deliveryZoneId](#deliveryzoneid) | `integer` | Required | cannot be null | [VendedorZona](vendedorzona-properties-deliveryzoneid.md "undefined#/properties/deliveryZoneId") |
| [id](#id)                         | `integer` | Required | cannot be null | [VendedorZona](vendedorzona-properties-id.md "undefined#/properties/id")                         |
| [tenantId](#tenantid)             | `integer` | Required | cannot be null | [VendedorZona](vendedorzona-properties-tenantid.md "undefined#/properties/tenantId")             |
| [vendedor](#vendedor)             | `object`  | Optional | cannot be null | [VendedorZona](vendedorzona-properties-vendedor.md "undefined#/properties/vendedor")             |
| [vendedorId](#vendedorid)         | `integer` | Required | cannot be null | [VendedorZona](vendedorzona-properties-vendedorid.md "undefined#/properties/vendedorId")         |

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [VendedorZona](vendedorzona-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## deliveryZone



`deliveryZone`

* is optional

* Type: `object` ([Details](vendedorzona-properties-deliveryzone.md))

* cannot be null

* defined in: [VendedorZona](vendedorzona-properties-deliveryzone.md "undefined#/properties/deliveryZone")

### deliveryZone Type

`object` ([Details](vendedorzona-properties-deliveryzone.md))

## deliveryZoneId



`deliveryZoneId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VendedorZona](vendedorzona-properties-deliveryzoneid.md "undefined#/properties/deliveryZoneId")

### deliveryZoneId Type

`integer`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [VendedorZona](vendedorzona-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## tenantId



`tenantId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VendedorZona](vendedorzona-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## vendedor



`vendedor`

* is optional

* Type: `object` ([Details](vendedorzona-properties-vendedor.md))

* cannot be null

* defined in: [VendedorZona](vendedorzona-properties-vendedor.md "undefined#/properties/vendedor")

### vendedor Type

`object` ([Details](vendedorzona-properties-vendedor.md))

## vendedorId



`vendedorId`

* is required

* Type: `integer`

* cannot be null

* defined in: [VendedorZona](vendedorzona-properties-vendedorid.md "undefined#/properties/vendedorId")

### vendedorId Type

`integer`
