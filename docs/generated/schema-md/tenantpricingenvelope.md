# TenantPricingEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantPricingEnvelope.schema.json](../schema-json/TenantPricingEnvelope.schema.json "open original schema") |

## TenantPricingEnvelope Type

`object` ([TenantPricingEnvelope](tenantpricingenvelope.md))

# TenantPricingEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                           |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [TenantPricingEnvelope](tenantpricingdata.md "undefined#/properties/data")                           |
| [success](#success) | `boolean` | Required | cannot be null | [TenantPricingEnvelope](tenantpricingenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([TenantPricingData](tenantpricingdata.md))

* cannot be null

* defined in: [TenantPricingEnvelope](tenantpricingdata.md "undefined#/properties/data")

### data Type

`object` ([TenantPricingData](tenantpricingdata.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TenantPricingEnvelope](tenantpricingenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
