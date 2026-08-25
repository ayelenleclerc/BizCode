# Untitled object in ReposicionOcCreatedEnvelope Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ReposicionOcCreatedEnvelope.schema.json\*](../schema-json/ReposicionOcCreatedEnvelope.schema.json "open original schema") |

## data Type

`object` ([Details](reposicionoccreatedenvelope-properties-data.md))

# data Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                                                                                       |
| :-------------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| [lines](#lines)             | `array`  | Required | cannot be null | [ReposicionOcCreatedEnvelope](reposicionoccreatedenvelope-properties-data-properties-lines.md "undefined#/properties/data/properties/lines")     |
| [ordenCompra](#ordencompra) | `object` | Required | cannot be null | [ReposicionOcCreatedEnvelope](ordencompra.md "undefined#/properties/data/properties/ordenCompra")                                                |
| [skipped](#skipped)         | `array`  | Required | cannot be null | [ReposicionOcCreatedEnvelope](reposicionoccreatedenvelope-properties-data-properties-skipped.md "undefined#/properties/data/properties/skipped") |

## lines



`lines`

* is required

* Type: `object[]` ([OrdenCompraItemInput](ordencompraiteminput.md))

* cannot be null

* defined in: [ReposicionOcCreatedEnvelope](reposicionoccreatedenvelope-properties-data-properties-lines.md "undefined#/properties/data/properties/lines")

### lines Type

`object[]` ([OrdenCompraItemInput](ordencompraiteminput.md))

## ordenCompra



`ordenCompra`

* is required

* Type: `object` ([OrdenCompra](ordencompra.md))

* cannot be null

* defined in: [ReposicionOcCreatedEnvelope](ordencompra.md "undefined#/properties/data/properties/ordenCompra")

### ordenCompra Type

`object` ([OrdenCompra](ordencompra.md))

## skipped



`skipped`

* is required

* Type: `integer[]`

* cannot be null

* defined in: [ReposicionOcCreatedEnvelope](reposicionoccreatedenvelope-properties-data-properties-skipped.md "undefined#/properties/data/properties/skipped")

### skipped Type

`integer[]`
