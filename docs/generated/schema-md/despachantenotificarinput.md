# DespachanteNotificarInput Schema

```txt
undefined
```

Customs broker contact (#206). When omitted the values already stored on the order are used; the request fails with 422 when neither the body nor the order provides an email.

| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                           |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [DespachanteNotificarInput.schema.json](../schema-json/DespachanteNotificarInput.schema.json "open original schema") |

## DespachanteNotificarInput Type

`object` ([DespachanteNotificarInput](despachantenotificarinput.md))

# DespachanteNotificarInput Properties

| Property                                | Type     | Required | Nullable       | Defined by                                                                                                                       |
| :-------------------------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [despachanteEmail](#despachanteemail)   | `string` | Optional | cannot be null | [DespachanteNotificarInput](despachantenotificarinput-properties-despachanteemail.md "undefined#/properties/despachanteEmail")   |
| [despachanteNombre](#despachantenombre) | `string` | Optional | cannot be null | [DespachanteNotificarInput](despachantenotificarinput-properties-despachantenombre.md "undefined#/properties/despachanteNombre") |

## despachanteEmail



`despachanteEmail`

* is optional

* Type: `string`

* cannot be null

* defined in: [DespachanteNotificarInput](despachantenotificarinput-properties-despachanteemail.md "undefined#/properties/despachanteEmail")

### despachanteEmail Type

`string`

### despachanteEmail Constraints

**maximum length**: the maximum number of characters for this string is: `160`

**email**: the string must be an email address, according to [RFC 5322, section 3.4.1](https://tools.ietf.org/html/rfc5322 "check the specification")

## despachanteNombre



`despachanteNombre`

* is optional

* Type: `string`

* cannot be null

* defined in: [DespachanteNotificarInput](despachantenotificarinput-properties-despachantenombre.md "undefined#/properties/despachanteNombre")

### despachanteNombre Type

`string`

### despachanteNombre Constraints

**maximum length**: the maximum number of characters for this string is: `120`
