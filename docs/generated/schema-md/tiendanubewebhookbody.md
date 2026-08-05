# TiendanubeWebhookBody Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TiendanubeWebhookBody.schema.json](../schema-json/TiendanubeWebhookBody.schema.json "open original schema") |

## TiendanubeWebhookBody Type

`object` ([TiendanubeWebhookBody](tiendanubewebhookbody.md))

# TiendanubeWebhookBody Properties

| Property               | Type     | Required | Nullable       | Defined by                                                                                             |
| :--------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [event](#event)        | `string` | Required | cannot be null | [TiendanubeWebhookBody](tiendanubewebhookbody-properties-event.md "undefined#/properties/event")       |
| [id](#id)              | Merged   | Optional | cannot be null | [TiendanubeWebhookBody](tiendanubewebhookbody-properties-id.md "undefined#/properties/id")             |
| [store\_id](#store_id) | Merged   | Required | cannot be null | [TiendanubeWebhookBody](tiendanubewebhookbody-properties-store_id.md "undefined#/properties/store_id") |

## event



`event`

* is required

* Type: `string`

* cannot be null

* defined in: [TiendanubeWebhookBody](tiendanubewebhookbody-properties-event.md "undefined#/properties/event")

### event Type

`string`

## id



`id`

* is optional

* Type: merged type ([Details](tiendanubewebhookbody-properties-id.md))

* cannot be null

* defined in: [TiendanubeWebhookBody](tiendanubewebhookbody-properties-id.md "undefined#/properties/id")

### id Type

merged type ([Details](tiendanubewebhookbody-properties-id.md))

one (and only one) of

* [Untitled string in TiendanubeWebhookBody](tiendanubewebhookbody-properties-id-oneof-0.md "check type definition")

* [Untitled integer in TiendanubeWebhookBody](tiendanubewebhookbody-properties-id-oneof-1.md "check type definition")

## store\_id



`store_id`

* is required

* Type: merged type ([Details](tiendanubewebhookbody-properties-store_id.md))

* cannot be null

* defined in: [TiendanubeWebhookBody](tiendanubewebhookbody-properties-store_id.md "undefined#/properties/store_id")

### store\_id Type

merged type ([Details](tiendanubewebhookbody-properties-store_id.md))

one (and only one) of

* [Untitled string in TiendanubeWebhookBody](tiendanubewebhookbody-properties-store_id-oneof-0.md "check type definition")

* [Untitled integer in TiendanubeWebhookBody](tiendanubewebhookbody-properties-store_id-oneof-1.md "check type definition")
