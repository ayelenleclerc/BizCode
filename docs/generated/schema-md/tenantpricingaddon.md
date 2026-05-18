# TenantPricingAddon Schema

```txt
undefined#/properties/addons/items
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantPricingData.schema.json\*](../schema-json/TenantPricingData.schema.json "open original schema") |

## items Type

`object` ([TenantPricingAddon](tenantpricingaddon.md))

# items Properties

| Property                | Type     | Required | Nullable       | Defined by                                                                                         |
| :---------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------- |
| [moduleKey](#modulekey) | `string` | Required | cannot be null | [TenantPricingAddon](tenantpricingaddon-properties-modulekey.md "undefined#/properties/moduleKey") |
| [price](#price)         | `number` | Required | cannot be null | [TenantPricingAddon](tenantpricingaddon-properties-price.md "undefined#/properties/price")         |

## moduleKey



`moduleKey`

* is required

* Type: `string`

* cannot be null

* defined in: [TenantPricingAddon](tenantpricingaddon-properties-modulekey.md "undefined#/properties/moduleKey")

### moduleKey Type

`string`

## price



`price`

* is required

* Type: `number`

* cannot be null

* defined in: [TenantPricingAddon](tenantpricingaddon-properties-price.md "undefined#/properties/price")

### price Type

`number`

### price Constraints

**minimum**: the value of this number must greater than or equal to: `0`
