# SaasInvoice Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [SaasInvoice.schema.json](../schema-json/SaasInvoice.schema.json "open original schema") |

## SaasInvoice Type

`object` ([SaasInvoice](saasinvoice.md))

# SaasInvoice Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                               |
| :-------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------- |
| [amount](#amount)           | `string`  | Required | cannot be null | [SaasInvoice](saasinvoice-properties-amount.md "undefined#/properties/amount")           |
| [createdAt](#createdat)     | `string`  | Required | cannot be null | [SaasInvoice](saasinvoice-properties-createdat.md "undefined#/properties/createdAt")     |
| [currency](#currency)       | `string`  | Required | cannot be null | [SaasInvoice](saasinvoice-properties-currency.md "undefined#/properties/currency")       |
| [id](#id)                   | `integer` | Required | cannot be null | [SaasInvoice](saasinvoice-properties-id.md "undefined#/properties/id")                   |
| [periodEnd](#periodend)     | `string`  | Required | cannot be null | [SaasInvoice](saasinvoice-properties-periodend.md "undefined#/properties/periodEnd")     |
| [periodStart](#periodstart) | `string`  | Required | cannot be null | [SaasInvoice](saasinvoice-properties-periodstart.md "undefined#/properties/periodStart") |
| [planKey](#plankey)         | `string`  | Required | cannot be null | [SaasInvoice](saasinvoice-properties-plankey.md "undefined#/properties/planKey")         |
| [status](#status)           | `string`  | Required | cannot be null | [SaasInvoice](saasinvoice-properties-status.md "undefined#/properties/status")           |

## amount



`amount`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasInvoice](saasinvoice-properties-amount.md "undefined#/properties/amount")

### amount Type

`string`

## createdAt



`createdAt`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasInvoice](saasinvoice-properties-createdat.md "undefined#/properties/createdAt")

### createdAt Type

`string`

### createdAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## currency



`currency`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasInvoice](saasinvoice-properties-currency.md "undefined#/properties/currency")

### currency Type

`string`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [SaasInvoice](saasinvoice-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## periodEnd



`periodEnd`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasInvoice](saasinvoice-properties-periodend.md "undefined#/properties/periodEnd")

### periodEnd Type

`string`

### periodEnd Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## periodStart



`periodStart`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasInvoice](saasinvoice-properties-periodstart.md "undefined#/properties/periodStart")

### periodStart Type

`string`

### periodStart Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## planKey



`planKey`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasInvoice](saasinvoice-properties-plankey.md "undefined#/properties/planKey")

### planKey Type

`string`

## status



`status`

* is required

* Type: `string`

* cannot be null

* defined in: [SaasInvoice](saasinvoice-properties-status.md "undefined#/properties/status")

### status Type

`string`
