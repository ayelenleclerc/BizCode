# TenantConfigHistoryData Schema

```txt
undefined#/properties/data
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                                 |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantConfigHistoryEnvelope.schema.json\*](../schema-json/TenantConfigHistoryEnvelope.schema.json "open original schema") |

## data Type

`object` ([TenantConfigHistoryData](tenantconfighistorydata.md))

# data Properties

| Property        | Type      | Required | Nullable       | Defined by                                                                                           |
| :-------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| [items](#items) | `array`   | Required | cannot be null | [TenantConfigHistoryData](tenantconfighistorydata-properties-items.md "undefined#/properties/items") |
| [total](#total) | `integer` | Required | cannot be null | [TenantConfigHistoryData](tenantconfighistorydata-properties-total.md "undefined#/properties/total") |

## items



`items`

* is required

* Type: `object[]` ([TenantConfigHistoryEntry](tenantconfighistoryentry.md))

* cannot be null

* defined in: [TenantConfigHistoryData](tenantconfighistorydata-properties-items.md "undefined#/properties/items")

### items Type

`object[]` ([TenantConfigHistoryEntry](tenantconfighistoryentry.md))

## total



`total`

* is required

* Type: `integer`

* cannot be null

* defined in: [TenantConfigHistoryData](tenantconfighistorydata-properties-total.md "undefined#/properties/total")

### total Type

`integer`
