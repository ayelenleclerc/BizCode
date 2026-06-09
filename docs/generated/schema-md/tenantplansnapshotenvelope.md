# TenantPlanSnapshotEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                             |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [TenantPlanSnapshotEnvelope.schema.json](../schema-json/TenantPlanSnapshotEnvelope.schema.json "open original schema") |

## TenantPlanSnapshotEnvelope Type

`object` ([TenantPlanSnapshotEnvelope](tenantplansnapshotenvelope.md))

# TenantPlanSnapshotEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                     |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------- |
| [data](#data)       | `object`  | Required | cannot be null | [TenantPlanSnapshotEnvelope](tenantplansnapshot.md "undefined#/properties/data")                               |
| [success](#success) | `boolean` | Required | cannot be null | [TenantPlanSnapshotEnvelope](tenantplansnapshotenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object` ([TenantPlanSnapshot](tenantplansnapshot.md))

* cannot be null

* defined in: [TenantPlanSnapshotEnvelope](tenantplansnapshot.md "undefined#/properties/data")

### data Type

`object` ([TenantPlanSnapshot](tenantplansnapshot.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [TenantPlanSnapshotEnvelope](tenantplansnapshotenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
