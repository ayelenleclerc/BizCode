# EcommerceConnectorStatus Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [EcommerceConnectorStatus.schema.json](../schema-json/EcommerceConnectorStatus.schema.json "open original schema") |

## EcommerceConnectorStatus Type

`object` ([EcommerceConnectorStatus](ecommerceconnectorstatus.md))

# EcommerceConnectorStatus Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                             |
| :------------------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [connectorType](#connectortype) | `string`  | Required | cannot be null | [EcommerceConnectorStatus](ecommerceconnectorstatus-properties-connectortype.md "undefined#/properties/connectorType") |
| [registered](#registered)       | `boolean` | Required | cannot be null | [EcommerceConnectorStatus](ecommerceconnectorstatus-properties-registered.md "undefined#/properties/registered")       |
| [status](#status)               | `string`  | Required | cannot be null | [EcommerceConnectorStatus](ecommerceconnectorstatus-properties-status.md "undefined#/properties/status")               |

## connectorType



`connectorType`

* is required

* Type: `string`

* cannot be null

* defined in: [EcommerceConnectorStatus](ecommerceconnectorstatus-properties-connectortype.md "undefined#/properties/connectorType")

### connectorType Type

`string`

### connectorType Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value           | Explanation |
| :-------------- | :---------- |
| `"meli"`        |             |
| `"tiendanube"`  |             |
| `"woocommerce"` |             |

## registered



`registered`

* is required

* Type: `boolean`

* cannot be null

* defined in: [EcommerceConnectorStatus](ecommerceconnectorstatus-properties-registered.md "undefined#/properties/registered")

### registered Type

`boolean`

## status



`status`

* is required

* Type: `string`

* cannot be null

* defined in: [EcommerceConnectorStatus](ecommerceconnectorstatus-properties-status.md "undefined#/properties/status")

### status Type

`string`

### status Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value              | Explanation |
| :----------------- | :---------- |
| `"active"`         |             |
| `"inactive"`       |             |
| `"not_configured"` |             |
