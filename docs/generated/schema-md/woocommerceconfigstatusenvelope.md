# WooCommerceConfigStatusEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [WooCommerceConfigStatusEnvelope.schema.json](../schema-json/WooCommerceConfigStatusEnvelope.schema.json "open original schema") |

## WooCommerceConfigStatusEnvelope Type

`object` ([WooCommerceConfigStatusEnvelope](woocommerceconfigstatusenvelope.md))

# WooCommerceConfigStatusEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                               |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [WooCommerceConfigStatusEnvelope](woocommerceconfigstatus.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [WooCommerceConfigStatusEnvelope](woocommerceconfigstatusenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([WooCommerceConfigStatus](woocommerceconfigstatus.md))

* cannot be null

* defined in: [WooCommerceConfigStatusEnvelope](woocommerceconfigstatus.md "undefined#/properties/data")

### data Type

`object` ([WooCommerceConfigStatus](woocommerceconfigstatus.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [WooCommerceConfigStatusEnvelope](woocommerceconfigstatusenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
