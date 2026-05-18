# TenantFeaturesEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                     |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantFeaturesEnvelope.schema.json](../schema-json/TenantFeaturesEnvelope.schema.json "open original schema") |

## TenantFeaturesEnvelope Type

`object` ([TenantFeaturesEnvelope](tenantfeaturesenvelope.md))

# TenantFeaturesEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                             |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [TenantFeaturesEnvelope](tenantfeaturesdata.md "undefined#/properties/data")                           |
| [success](#success) | `boolean` | Required | cannot be null | [TenantFeaturesEnvelope](tenantfeaturesenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([TenantFeaturesData](tenantfeaturesdata.md))

* cannot be null

* defined in: [TenantFeaturesEnvelope](tenantfeaturesdata.md "undefined#/properties/data")

### data Type

`object` ([TenantFeaturesData](tenantfeaturesdata.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TenantFeaturesEnvelope](tenantfeaturesenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
