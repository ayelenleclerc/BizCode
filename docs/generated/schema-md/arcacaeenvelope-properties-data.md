# Untitled object in ArcaCaeEnvelope Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ArcaCaeEnvelope.schema.json\*](../schema-json/ArcaCaeEnvelope.schema.json "open original schema") |

## data Type

`object` ([Details](arcacaeenvelope-properties-data.md))

# data Properties

| Property          | Type     | Required | Nullable       | Defined by                                                                                                             |
| :---------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [cae](#cae)       | `string` | Optional | cannot be null | [ArcaCaeEnvelope](arcacaeenvelope-properties-data-properties-cae.md "undefined#/properties/data/properties/cae")       |
| [caeVto](#caevto) | `string` | Optional | cannot be null | [ArcaCaeEnvelope](arcacaeenvelope-properties-data-properties-caevto.md "undefined#/properties/data/properties/caeVto") |

## cae



`cae`

* is optional

* Type: `string`

* cannot be null

* defined in: [ArcaCaeEnvelope](arcacaeenvelope-properties-data-properties-cae.md "undefined#/properties/data/properties/cae")

### cae Type

`string`

## caeVto



`caeVto`

* is optional

* Type: `string`

* cannot be null

* defined in: [ArcaCaeEnvelope](arcacaeenvelope-properties-data-properties-caevto.md "undefined#/properties/data/properties/caeVto")

### caeVto Type

`string`

### caeVto Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
