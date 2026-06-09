# TenantConfigHistoryEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantConfigHistoryEnvelope.schema.json](../schema-json/TenantConfigHistoryEnvelope.schema.json "open original schema") |

## TenantConfigHistoryEnvelope Type

`object` ([TenantConfigHistoryEnvelope](tenantconfighistoryenvelope.md))

# TenantConfigHistoryEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [TenantConfigHistoryEnvelope](tenantconfighistorydata.md "undefined#/properties/data")                           |
| [success](#success) | `boolean` | Required | cannot be null | [TenantConfigHistoryEnvelope](tenantconfighistoryenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([TenantConfigHistoryData](tenantconfighistorydata.md))

* cannot be null

* defined in: [TenantConfigHistoryEnvelope](tenantconfighistorydata.md "undefined#/properties/data")

### data Type

`object` ([TenantConfigHistoryData](tenantconfighistorydata.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TenantConfigHistoryEnvelope](tenantconfighistoryenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
