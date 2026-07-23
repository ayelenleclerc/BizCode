# ListaPrecio Schema

```txt
undefined#/allOf/0/properties/data/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ListaPrecioListEnvelope.schema.json\*](../schema-json/ListaPrecioListEnvelope.schema.json "open original schema") |

## items Type

`object` ([ListaPrecio](listaprecio.md))

# items Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                   |
| :------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------- |
| [activa](#activa)               | `boolean` | Optional | cannot be null | [ListaPrecio](listaprecio-properties-activa.md "undefined#/properties/activa")               |
| [esDefault](#esdefault)         | `boolean` | Optional | cannot be null | [ListaPrecio](listaprecio-properties-esdefault.md "undefined#/properties/esDefault")         |
| [id](#id)                       | `integer` | Optional | cannot be null | [ListaPrecio](listaprecio-properties-id.md "undefined#/properties/id")                       |
| [items](#items)                 | `array`   | Optional | cannot be null | [ListaPrecio](listaprecio-properties-items.md "undefined#/properties/items")                 |
| [moneda](#moneda)               | `string`  | Optional | cannot be null | [ListaPrecio](listaprecio-properties-moneda.md "undefined#/properties/moneda")               |
| [nombre](#nombre)               | `string`  | Optional | cannot be null | [ListaPrecio](listaprecio-properties-nombre.md "undefined#/properties/nombre")               |
| [tenantId](#tenantid)           | `integer` | Optional | cannot be null | [ListaPrecio](listaprecio-properties-tenantid.md "undefined#/properties/tenantId")           |
| [vigenciaHasta](#vigenciahasta) | `string`  | Optional | cannot be null | [ListaPrecio](listaprecio-properties-vigenciahasta.md "undefined#/properties/vigenciaHasta") |
| Additional Properties           | Any       | Optional | can be null    |                                                                                              |

## activa



`activa`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [ListaPrecio](listaprecio-properties-activa.md "undefined#/properties/activa")

### activa Type

`boolean`

## esDefault



`esDefault`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [ListaPrecio](listaprecio-properties-esdefault.md "undefined#/properties/esDefault")

### esDefault Type

`boolean`

## id



`id`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ListaPrecio](listaprecio-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## items



`items`

* is optional

* Type: `object[]` ([ListaPrecioItem](listaprecioitem.md))

* cannot be null

* defined in: [ListaPrecio](listaprecio-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([ListaPrecioItem](listaprecioitem.md))

## moneda



`moneda`

* is optional

* Type: `string`

* cannot be null

* defined in: [ListaPrecio](listaprecio-properties-moneda.md "undefined#/properties/moneda")

### moneda Type

`string`

## nombre



`nombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [ListaPrecio](listaprecio-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

## tenantId



`tenantId`

* is optional

* Type: `integer`

* cannot be null

* defined in: [ListaPrecio](listaprecio-properties-tenantid.md "undefined#/properties/tenantId")

### tenantId Type

`integer`

## vigenciaHasta



`vigenciaHasta`

* is optional

* Type: `string`

* cannot be null

* defined in: [ListaPrecio](listaprecio-properties-vigenciahasta.md "undefined#/properties/vigenciaHasta")

### vigenciaHasta Type

`string`

### vigenciaHasta Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
