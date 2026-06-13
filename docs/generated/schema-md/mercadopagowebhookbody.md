# MercadoPagoWebhookBody Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MercadoPagoWebhookBody.schema.json](../schema-json/MercadoPagoWebhookBody.schema.json "open original schema") |

## MercadoPagoWebhookBody Type

`object` ([MercadoPagoWebhookBody](mercadopagowebhookbody.md))

# MercadoPagoWebhookBody Properties

| Property                 | Type      | Required | Nullable       | Defined by                                                                                                 |
| :----------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------- |
| [action](#action)        | `string`  | Optional | cannot be null | [MercadoPagoWebhookBody](mercadopagowebhookbody-properties-action.md "undefined#/properties/action")       |
| [data](#data)            | `object`  | Optional | cannot be null | [MercadoPagoWebhookBody](mercadopagowebhookbody-properties-data.md "undefined#/properties/data")           |
| [id](#id)                | Merged    | Optional | cannot be null | [MercadoPagoWebhookBody](mercadopagowebhookbody-properties-id.md "undefined#/properties/id")               |
| [live\_mode](#live_mode) | `boolean` | Optional | cannot be null | [MercadoPagoWebhookBody](mercadopagowebhookbody-properties-live_mode.md "undefined#/properties/live_mode") |
| [type](#type)            | `string`  | Optional | cannot be null | [MercadoPagoWebhookBody](mercadopagowebhookbody-properties-type.md "undefined#/properties/type")           |
| [user\_id](#user_id)     | Merged    | Optional | cannot be null | [MercadoPagoWebhookBody](mercadopagowebhookbody-properties-user_id.md "undefined#/properties/user_id")     |

## action



`action`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoWebhookBody](mercadopagowebhookbody-properties-action.md "undefined#/properties/action")

### action Type

`string`

## data



`data`

* is optional

* Type: `object` ([Details](mercadopagowebhookbody-properties-data.md))

* cannot be null

* defined in: [MercadoPagoWebhookBody](mercadopagowebhookbody-properties-data.md "undefined#/properties/data")

### data Type

`object` ([Details](mercadopagowebhookbody-properties-data.md))

## id



`id`

* is optional

* Type: merged type ([Details](mercadopagowebhookbody-properties-id.md))

* cannot be null

* defined in: [MercadoPagoWebhookBody](mercadopagowebhookbody-properties-id.md "undefined#/properties/id")

### id Type

merged type ([Details](mercadopagowebhookbody-properties-id.md))

one (and only one) of

* [Untitled string in MercadoPagoWebhookBody](mercadopagowebhookbody-properties-id-oneof-0.md "check type definition")

* [Untitled integer in MercadoPagoWebhookBody](mercadopagowebhookbody-properties-id-oneof-1.md "check type definition")

## live\_mode



`live_mode`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [MercadoPagoWebhookBody](mercadopagowebhookbody-properties-live_mode.md "undefined#/properties/live_mode")

### live\_mode Type

`boolean`

## type



`type`

* is optional

* Type: `string`

* cannot be null

* defined in: [MercadoPagoWebhookBody](mercadopagowebhookbody-properties-type.md "undefined#/properties/type")

### type Type

`string`

## user\_id



`user_id`

* is optional

* Type: merged type ([Details](mercadopagowebhookbody-properties-user_id.md))

* cannot be null

* defined in: [MercadoPagoWebhookBody](mercadopagowebhookbody-properties-user_id.md "undefined#/properties/user_id")

### user\_id Type

merged type ([Details](mercadopagowebhookbody-properties-user_id.md))

one (and only one) of

* [Untitled string in MercadoPagoWebhookBody](mercadopagowebhookbody-properties-user_id-oneof-0.md "check type definition")

* [Untitled integer in MercadoPagoWebhookBody](mercadopagowebhookbody-properties-user_id-oneof-1.md "check type definition")
