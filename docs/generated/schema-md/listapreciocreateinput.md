# ListaPrecioCreateInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ListaPrecioCreateInput.schema.json](../schema-json/ListaPrecioCreateInput.schema.json "open original schema") |

## ListaPrecioCreateInput Type

`object` ([ListaPrecioCreateInput](listapreciocreateinput.md))

# ListaPrecioCreateInput Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                         |
| :------------------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| [activa](#activa)               | `boolean` | Optional | cannot be null | [ListaPrecioCreateInput](listapreciocreateinput-properties-activa.md "undefined#/properties/activa")               |
| [esDefault](#esdefault)         | `boolean` | Optional | cannot be null | [ListaPrecioCreateInput](listapreciocreateinput-properties-esdefault.md "undefined#/properties/esDefault")         |
| [moneda](#moneda)               | `string`  | Optional | cannot be null | [ListaPrecioCreateInput](listapreciocreateinput-properties-moneda.md "undefined#/properties/moneda")               |
| [nombre](#nombre)               | `string`  | Required | cannot be null | [ListaPrecioCreateInput](listapreciocreateinput-properties-nombre.md "undefined#/properties/nombre")               |
| [vigenciaHasta](#vigenciahasta) | `string`  | Optional | cannot be null | [ListaPrecioCreateInput](listapreciocreateinput-properties-vigenciahasta.md "undefined#/properties/vigenciaHasta") |

## activa



`activa`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [ListaPrecioCreateInput](listapreciocreateinput-properties-activa.md "undefined#/properties/activa")

### activa Type

`boolean`

## esDefault



`esDefault`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [ListaPrecioCreateInput](listapreciocreateinput-properties-esdefault.md "undefined#/properties/esDefault")

### esDefault Type

`boolean`

## moneda



`moneda`

* is optional

* Type: `string`

* cannot be null

* defined in: [ListaPrecioCreateInput](listapreciocreateinput-properties-moneda.md "undefined#/properties/moneda")

### moneda Type

`string`

### moneda Constraints

**maximum length**: the maximum number of characters for this string is: `3`

**minimum length**: the minimum number of characters for this string is: `3`

## nombre



`nombre`

* is required

* Type: `string`

* cannot be null

* defined in: [ListaPrecioCreateInput](listapreciocreateinput-properties-nombre.md "undefined#/properties/nombre")

### nombre Type

`string`

### nombre Constraints

**maximum length**: the maximum number of characters for this string is: `80`

**minimum length**: the minimum number of characters for this string is: `1`

## vigenciaHasta



`vigenciaHasta`

* is optional

* Type: `string`

* cannot be null

* defined in: [ListaPrecioCreateInput](listapreciocreateinput-properties-vigenciahasta.md "undefined#/properties/vigenciaHasta")

### vigenciaHasta Type

`string`

### vigenciaHasta Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
