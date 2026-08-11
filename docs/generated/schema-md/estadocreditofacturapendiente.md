# EstadoCreditoFacturaPendiente Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [EstadoCreditoFacturaPendiente.schema.json](../schema-json/EstadoCreditoFacturaPendiente.schema.json "open original schema") |

## EstadoCreditoFacturaPendiente Type

`object` ([EstadoCreditoFacturaPendiente](estadocreditofacturapendiente.md))

# EstadoCreditoFacturaPendiente Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                                   |
| :-------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [diasMora](#diasmora)       | `integer` | Required | cannot be null | [EstadoCreditoFacturaPendiente](estadocreditofacturapendiente-properties-diasmora.md "undefined#/properties/diasMora")       |
| [id](#id)                   | `integer` | Required | cannot be null | [EstadoCreditoFacturaPendiente](estadocreditofacturapendiente-properties-id.md "undefined#/properties/id")                   |
| [saldo](#saldo)             | `string`  | Required | cannot be null | [EstadoCreditoFacturaPendiente](estadocreditofacturapendiente-properties-saldo.md "undefined#/properties/saldo")             |
| [vencimiento](#vencimiento) | `string`  | Required | cannot be null | [EstadoCreditoFacturaPendiente](estadocreditofacturapendiente-properties-vencimiento.md "undefined#/properties/vencimiento") |

## diasMora



`diasMora`

* is required

* Type: `integer`

* cannot be null

* defined in: [EstadoCreditoFacturaPendiente](estadocreditofacturapendiente-properties-diasmora.md "undefined#/properties/diasMora")

### diasMora Type

`integer`

### diasMora Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [EstadoCreditoFacturaPendiente](estadocreditofacturapendiente-properties-id.md "undefined#/properties/id")

### id Type

`integer`

## saldo



`saldo`

* is required

* Type: `string`

* cannot be null

* defined in: [EstadoCreditoFacturaPendiente](estadocreditofacturapendiente-properties-saldo.md "undefined#/properties/saldo")

### saldo Type

`string`

## vencimiento



`vencimiento`

* is required

* Type: `string`

* cannot be null

* defined in: [EstadoCreditoFacturaPendiente](estadocreditofacturapendiente-properties-vencimiento.md "undefined#/properties/vencimiento")

### vencimiento Type

`string`

### vencimiento Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")
