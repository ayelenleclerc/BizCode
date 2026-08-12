# PedidoPrefill Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PedidoPrefillEnvelope.schema.json\*](../schema-json/PedidoPrefillEnvelope.schema.json "open original schema") |

## data Type

`object` ([PedidoPrefill](pedidoprefill.md))

# data Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                     |
| :---------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------- |
| [createdAt](#createdat)       | `string`  | Required | cannot be null | [PedidoPrefill](pedidoprefill-properties-createdat.md "undefined#/properties/createdAt")       |
| [lines](#lines)               | `array`   | Required | cannot be null | [PedidoPrefill](pedidoprefill-properties-lines.md "undefined#/properties/lines")               |
| [omitted](#omitted)           | `array`   | Required | cannot be null | [PedidoPrefill](pedidoprefill-properties-omitted.md "undefined#/properties/omitted")           |
| [omittedCount](#omittedcount) | `integer` | Required | cannot be null | [PedidoPrefill](pedidoprefill-properties-omittedcount.md "undefined#/properties/omittedCount") |
| [pedidoId](#pedidoid)         | `integer` | Required | cannot be null | [PedidoPrefill](pedidoprefill-properties-pedidoid.md "undefined#/properties/pedidoId")         |
| [plantillaId](#plantillaid)   | `integer` | Required | cannot be null | [PedidoPrefill](pedidoprefill-properties-plantillaid.md "undefined#/properties/plantillaId")   |
| [source](#source)             | `string`  | Required | cannot be null | [PedidoPrefill](pedidoprefill-properties-source.md "undefined#/properties/source")             |
| [total](#total)               | `string`  | Required | cannot be null | [PedidoPrefill](pedidoprefill-properties-total.md "undefined#/properties/total")               |

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [PedidoPrefill](pedidoprefill-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## lines



`lines`

* is required

* Type: `object[]` ([PedidoPrefillLine](pedidoprefillline.md))

* cannot be null

* defined in: [PedidoPrefill](pedidoprefill-properties-lines.md "undefined#/properties/lines")

### lines Type

`object[]` ([PedidoPrefillLine](pedidoprefillline.md))

## omitted



`omitted`

* is required

* Type: `object[]` ([PedidoPrefillOmitted](pedidoprefillomitted.md))

* cannot be null

* defined in: [PedidoPrefill](pedidoprefill-properties-omitted.md "undefined#/properties/omitted")

### omitted Type

`object[]` ([PedidoPrefillOmitted](pedidoprefillomitted.md))

## omittedCount



`omittedCount`

* is required

* Type: `integer`

* cannot be null

* defined in: [PedidoPrefill](pedidoprefill-properties-omittedcount.md "undefined#/properties/omittedCount")

### omittedCount Type

`integer`

### omittedCount Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## pedidoId



`pedidoId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PedidoPrefill](pedidoprefill-properties-pedidoid.md "undefined#/properties/pedidoId")

### pedidoId Type

`integer`

## plantillaId



`plantillaId`

* is required

* Type: `integer`

* cannot be null

* defined in: [PedidoPrefill](pedidoprefill-properties-plantillaid.md "undefined#/properties/plantillaId")

### plantillaId Type

`integer`

## source



`source`

* is required

* Type: `string`

* cannot be null

* defined in: [PedidoPrefill](pedidoprefill-properties-source.md "undefined#/properties/source")

### source Type

`string`

### source Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"last_pedido"` |             |
| `"plantilla"`   |             |

## total



`total`

* is required

* Type: `string`

* cannot be null

* defined in: [PedidoPrefill](pedidoprefill-properties-total.md "undefined#/properties/total")

### total Type

`string`
