# Untitled object in DespachanteNotificacionEnvelope Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DespachanteNotificacionEnvelope.schema.json\*](../schema-json/DespachanteNotificacionEnvelope.schema.json "open original schema") |

## data Type

`object` ([Details](despachantenotificacionenvelope-properties-data.md))

# data Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                                                                                 |
| :------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [despachanteEmail](#despachanteemail) | `string`  | Required | cannot be null | [DespachanteNotificacionEnvelope](despachantenotificacionenvelope-properties-data-properties-despachanteemail.md "undefined#/properties/data/properties/despachanteEmail") |
| [enviado](#enviado)                   | `boolean` | Required | cannot be null | [DespachanteNotificacionEnvelope](despachantenotificacionenvelope-properties-data-properties-enviado.md "undefined#/properties/data/properties/enviado")                   |
| [pedidoId](#pedidoid)                 | `integer` | Required | cannot be null | [DespachanteNotificacionEnvelope](despachantenotificacionenvelope-properties-data-properties-pedidoid.md "undefined#/properties/data/properties/pedidoId")                 |

## despachanteEmail



`despachanteEmail`

* is required

* Type: `string`

* cannot be null

* defined in: [DespachanteNotificacionEnvelope](despachantenotificacionenvelope-properties-data-properties-despachanteemail.md "undefined#/properties/data/properties/despachanteEmail")

### despachanteEmail Type

`string`

### despachanteEmail Constraints

**email**: the string must be an email address, according to [RFC 5322, section 3.4.1](https://tools.ietf.org/html/rfc5322 "check the specification")

## enviado

False when SMTP is not configured; the attempt is audited anyway.

`enviado`

* is required

* Type: `boolean`

* cannot be null

* defined in: [DespachanteNotificacionEnvelope](despachantenotificacionenvelope-properties-data-properties-enviado.md "undefined#/properties/data/properties/enviado")

### enviado Type

`boolean`

## pedidoId



`pedidoId`

* is required

* Type: `integer`

* cannot be null

* defined in: [DespachanteNotificacionEnvelope](despachantenotificacionenvelope-properties-data-properties-pedidoid.md "undefined#/properties/data/properties/pedidoId")

### pedidoId Type

`integer`
