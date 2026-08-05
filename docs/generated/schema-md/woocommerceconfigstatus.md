# WooCommerceConfigStatus Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [WooCommerceConfigStatusEnvelope.schema.json\*](../schema-json/WooCommerceConfigStatusEnvelope.schema.json "open original schema") |

## data Type

`object` ([WooCommerceConfigStatus](woocommerceconfigstatus.md))

# data Properties

| Property                              | Type      | Required | Nullable       | Defined by                                                                                                                 |
| :------------------------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [activo](#activo)                     | `boolean` | Optional | cannot be null | [WooCommerceConfigStatus](woocommerceconfigstatus-properties-activo.md "undefined#/properties/activo")                     |
| [conectadoAt](#conectadoat)           | `string`  | Optional | cannot be null | [WooCommerceConfigStatus](woocommerceconfigstatus-properties-conectadoat.md "undefined#/properties/conectadoAt")           |
| [connected](#connected)               | `boolean` | Required | cannot be null | [WooCommerceConfigStatus](woocommerceconfigstatus-properties-connected.md "undefined#/properties/connected")               |
| [consumerKeyLast4](#consumerkeylast4) | `string`  | Optional | cannot be null | [WooCommerceConfigStatus](woocommerceconfigstatus-properties-consumerkeylast4.md "undefined#/properties/consumerKeyLast4") |
| [hasWebhookSecret](#haswebhooksecret) | `boolean` | Optional | cannot be null | [WooCommerceConfigStatus](woocommerceconfigstatus-properties-haswebhooksecret.md "undefined#/properties/hasWebhookSecret") |
| [storeName](#storename)               | `string`  | Optional | cannot be null | [WooCommerceConfigStatus](woocommerceconfigstatus-properties-storename.md "undefined#/properties/storeName")               |
| [storeUrl](#storeurl)                 | `string`  | Optional | cannot be null | [WooCommerceConfigStatus](woocommerceconfigstatus-properties-storeurl.md "undefined#/properties/storeUrl")                 |
| [webhookUrl](#webhookurl)             | `string`  | Optional | cannot be null | [WooCommerceConfigStatus](woocommerceconfigstatus-properties-webhookurl.md "undefined#/properties/webhookUrl")             |

## activo



`activo`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [WooCommerceConfigStatus](woocommerceconfigstatus-properties-activo.md "undefined#/properties/activo")

### activo Type

`boolean`

## conectadoAt



`conectadoAt`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommerceConfigStatus](woocommerceconfigstatus-properties-conectadoat.md "undefined#/properties/conectadoAt")

### conectadoAt Type

`string`

### conectadoAt Constraints

**date time**: the string must be a date time string, according to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339 "check the specification")

## connected



`connected`

* is required

* Type: `boolean`

* cannot be null

* defined in: [WooCommerceConfigStatus](woocommerceconfigstatus-properties-connected.md "undefined#/properties/connected")

### connected Type

`boolean`

## consumerKeyLast4



`consumerKeyLast4`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommerceConfigStatus](woocommerceconfigstatus-properties-consumerkeylast4.md "undefined#/properties/consumerKeyLast4")

### consumerKeyLast4 Type

`string`

## hasWebhookSecret



`hasWebhookSecret`

* is optional

* Type: `boolean`

* cannot be null

* defined in: [WooCommerceConfigStatus](woocommerceconfigstatus-properties-haswebhooksecret.md "undefined#/properties/hasWebhookSecret")

### hasWebhookSecret Type

`boolean`

## storeName



`storeName`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommerceConfigStatus](woocommerceconfigstatus-properties-storename.md "undefined#/properties/storeName")

### storeName Type

`string`

## storeUrl



`storeUrl`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommerceConfigStatus](woocommerceconfigstatus-properties-storeurl.md "undefined#/properties/storeUrl")

### storeUrl Type

`string`

## webhookUrl



`webhookUrl`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommerceConfigStatus](woocommerceconfigstatus-properties-webhookurl.md "undefined#/properties/webhookUrl")

### webhookUrl Type

`string`

### webhookUrl Constraints

**URI**: the string must be a URI, according to [RFC 3986](https://tools.ietf.org/html/rfc3986 "check the specification")
