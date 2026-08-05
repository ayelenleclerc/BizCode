# WooCommerceCredentialsInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [WooCommerceCredentialsInput.schema.json](../schema-json/WooCommerceCredentialsInput.schema.json "open original schema") |

## WooCommerceCredentialsInput Type

`object` ([WooCommerceCredentialsInput](woocommercecredentialsinput.md))

# WooCommerceCredentialsInput Properties

| Property                          | Type     | Required | Nullable       | Defined by                                                                                                                     |
| :-------------------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| [consumerKey](#consumerkey)       | `string` | Required | cannot be null | [WooCommerceCredentialsInput](woocommercecredentialsinput-properties-consumerkey.md "undefined#/properties/consumerKey")       |
| [consumerSecret](#consumersecret) | `string` | Required | cannot be null | [WooCommerceCredentialsInput](woocommercecredentialsinput-properties-consumersecret.md "undefined#/properties/consumerSecret") |
| [storeName](#storename)           | `string` | Optional | cannot be null | [WooCommerceCredentialsInput](woocommercecredentialsinput-properties-storename.md "undefined#/properties/storeName")           |
| [storeUrl](#storeurl)             | `string` | Required | cannot be null | [WooCommerceCredentialsInput](woocommercecredentialsinput-properties-storeurl.md "undefined#/properties/storeUrl")             |
| [webhookSecret](#webhooksecret)   | `string` | Optional | cannot be null | [WooCommerceCredentialsInput](woocommercecredentialsinput-properties-webhooksecret.md "undefined#/properties/webhookSecret")   |

## consumerKey



`consumerKey`

* is required

* Type: `string`

* cannot be null

* defined in: [WooCommerceCredentialsInput](woocommercecredentialsinput-properties-consumerkey.md "undefined#/properties/consumerKey")

### consumerKey Type

`string`

### consumerKey Constraints

**maximum length**: the maximum number of characters for this string is: `200`

## consumerSecret



`consumerSecret`

* is required

* Type: `string`

* cannot be null

* defined in: [WooCommerceCredentialsInput](woocommercecredentialsinput-properties-consumersecret.md "undefined#/properties/consumerSecret")

### consumerSecret Type

`string`

### consumerSecret Constraints

**maximum length**: the maximum number of characters for this string is: `200`

## storeName



`storeName`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommerceCredentialsInput](woocommercecredentialsinput-properties-storename.md "undefined#/properties/storeName")

### storeName Type

`string`

## storeUrl



`storeUrl`

* is required

* Type: `string`

* cannot be null

* defined in: [WooCommerceCredentialsInput](woocommercecredentialsinput-properties-storeurl.md "undefined#/properties/storeUrl")

### storeUrl Type

`string`

### storeUrl Constraints

**maximum length**: the maximum number of characters for this string is: `255`

**URI**: the string must be a URI, according to [RFC 3986](https://tools.ietf.org/html/rfc3986 "check the specification")

## webhookSecret



`webhookSecret`

* is optional

* Type: `string`

* cannot be null

* defined in: [WooCommerceCredentialsInput](woocommercecredentialsinput-properties-webhooksecret.md "undefined#/properties/webhookSecret")

### webhookSecret Type

`string`
