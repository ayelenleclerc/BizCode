# EcommerceConnectorsEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [EcommerceConnectorsEnvelope.schema.json](../schema-json/EcommerceConnectorsEnvelope.schema.json "open original schema") |

## EcommerceConnectorsEnvelope Type

`object` ([EcommerceConnectorsEnvelope](ecommerceconnectorsenvelope.md))

# EcommerceConnectorsEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [EcommerceConnectorsEnvelope](ecommerceconnectorsenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [EcommerceConnectorsEnvelope](ecommerceconnectorsenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([EcommerceConnectorStatus](ecommerceconnectorstatus.md))

* cannot be null

* defined in: [EcommerceConnectorsEnvelope](ecommerceconnectorsenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([EcommerceConnectorStatus](ecommerceconnectorstatus.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [EcommerceConnectorsEnvelope](ecommerceconnectorsenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
