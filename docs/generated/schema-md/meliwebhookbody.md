# MeliWebhookBody Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [MeliWebhookBody.schema.json](../schema-json/MeliWebhookBody.schema.json "open original schema") |

## MeliWebhookBody Type

`object` ([MeliWebhookBody](meliwebhookbody.md))

# MeliWebhookBody Properties

| Property                           | Type      | Required | Nullable       | Defined by                                                                                             |
| :--------------------------------- | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [application\_id](#application_id) | Merged    | Optional | cannot be null | [MeliWebhookBody](meliwebhookbody-properties-application_id.md "undefined#/properties/application_id") |
| [attempts](#attempts)              | `integer` | Optional | cannot be null | [MeliWebhookBody](meliwebhookbody-properties-attempts.md "undefined#/properties/attempts")             |
| [received](#received)              | `string`  | Optional | cannot be null | [MeliWebhookBody](meliwebhookbody-properties-received.md "undefined#/properties/received")             |
| [resource](#resource)              | `string`  | Required | cannot be null | [MeliWebhookBody](meliwebhookbody-properties-resource.md "undefined#/properties/resource")             |
| [sent](#sent)                      | `string`  | Optional | cannot be null | [MeliWebhookBody](meliwebhookbody-properties-sent.md "undefined#/properties/sent")                     |
| [topic](#topic)                    | `string`  | Required | cannot be null | [MeliWebhookBody](meliwebhookbody-properties-topic.md "undefined#/properties/topic")                   |
| [user\_id](#user_id)               | Merged    | Required | cannot be null | [MeliWebhookBody](meliwebhookbody-properties-user_id.md "undefined#/properties/user_id")               |

## application\_id



`application_id`

* is optional

* Type: merged type ([Details](meliwebhookbody-properties-application_id.md))

* cannot be null

* defined in: [MeliWebhookBody](meliwebhookbody-properties-application_id.md "undefined#/properties/application_id")

### application\_id Type

merged type ([Details](meliwebhookbody-properties-application_id.md))

one (and only one) of

* [Untitled string in MeliWebhookBody](meliwebhookbody-properties-application_id-oneof-0.md "check type definition")

* [Untitled integer in MeliWebhookBody](meliwebhookbody-properties-application_id-oneof-1.md "check type definition")

## attempts



`attempts`

* is optional

* Type: `integer`

* cannot be null

* defined in: [MeliWebhookBody](meliwebhookbody-properties-attempts.md "undefined#/properties/attempts")

### attempts Type

`integer`

## received



`received`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliWebhookBody](meliwebhookbody-properties-received.md "undefined#/properties/received")

### received Type

`string`

## resource

e.g. /orders/2000003509

`resource`

* is required

* Type: `string`

* cannot be null

* defined in: [MeliWebhookBody](meliwebhookbody-properties-resource.md "undefined#/properties/resource")

### resource Type

`string`

### resource Constraints

**maximum length**: the maximum number of characters for this string is: `200`

## sent



`sent`

* is optional

* Type: `string`

* cannot be null

* defined in: [MeliWebhookBody](meliwebhookbody-properties-sent.md "undefined#/properties/sent")

### sent Type

`string`

## topic

orders\_v2 | items | item\_price

`topic`

* is required

* Type: `string`

* cannot be null

* defined in: [MeliWebhookBody](meliwebhookbody-properties-topic.md "undefined#/properties/topic")

### topic Type

`string`

### topic Constraints

**maximum length**: the maximum number of characters for this string is: `40`

## user\_id



`user_id`

* is required

* Type: merged type ([Details](meliwebhookbody-properties-user_id.md))

* cannot be null

* defined in: [MeliWebhookBody](meliwebhookbody-properties-user_id.md "undefined#/properties/user_id")

### user\_id Type

merged type ([Details](meliwebhookbody-properties-user_id.md))

one (and only one) of

* [Untitled string in MeliWebhookBody](meliwebhookbody-properties-user_id-oneof-0.md "check type definition")

* [Untitled integer in MeliWebhookBody](meliwebhookbody-properties-user_id-oneof-1.md "check type definition")
