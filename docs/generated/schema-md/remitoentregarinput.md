# RemitoEntregarInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [RemitoEntregarInput.schema.json](../schema-json/RemitoEntregarInput.schema.json "open original schema") |

## RemitoEntregarInput Type

`object` ([RemitoEntregarInput](remitoentregarinput.md))

# RemitoEntregarInput Properties

| Property                      | Type     | Required | Nullable       | Defined by                                                                                                 |
| :---------------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [fechaEntrega](#fechaentrega) | `string` | Optional | cannot be null | [RemitoEntregarInput](remitoentregarinput-properties-fechaentrega.md "undefined#/properties/fechaEntrega") |
| [firmadoPor](#firmadopor)     | `string` | Required | cannot be null | [RemitoEntregarInput](remitoentregarinput-properties-firmadopor.md "undefined#/properties/firmadoPor")     |

## fechaEntrega



`fechaEntrega`

* is optional

* Type: `string`

* cannot be null

* defined in: [RemitoEntregarInput](remitoentregarinput-properties-fechaentrega.md "undefined#/properties/fechaEntrega")

### fechaEntrega Type

`string`

### fechaEntrega Constraints

**date**: the string must be a date string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## firmadoPor



`firmadoPor`

* is required

* Type: `string`

* cannot be null

* defined in: [RemitoEntregarInput](remitoentregarinput-properties-firmadopor.md "undefined#/properties/firmadoPor")

### firmadoPor Type

`string`

### firmadoPor Constraints

**maximum length**: the maximum number of characters for this string is: `120`

**minimum length**: the minimum number of characters for this string is: `2`
