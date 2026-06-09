# PlanCatalogEnvelope Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                               |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [PlanCatalogEnvelope.schema.json](../schema-json/PlanCatalogEnvelope.schema.json "open original schema") |

## PlanCatalogEnvelope Type

`object` ([PlanCatalogEnvelope](plancatalogenvelope.md))

# PlanCatalogEnvelope Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                       |
| :------------------ | :-------- | :------- | :------------- | :----------------------------------------------------------------------------------------------- |
| [data](#data)       | `array`   | Required | cannot be null | [PlanCatalogEnvelope](plancatalogenvelope-properties-data.md "undefined#/properties/data")       |
| [success](#success) | `boolean` | Required | cannot be null | [PlanCatalogEnvelope](plancatalogenvelope-properties-success.md "undefined#/properties/success") |

## data



`data`

* is required

* Type: `object[]` ([PublicPlan](publicplan.md))

* cannot be null

* defined in: [PlanCatalogEnvelope](plancatalogenvelope-properties-data.md "undefined#/properties/data")

### data Type

`object[]` ([PublicPlan](publicplan.md))

## success



`success`

* is required

* Type: `boolean`

* cannot be null

* defined in: [PlanCatalogEnvelope](plancatalogenvelope-properties-success.md "undefined#/properties/success")

### success Type

`boolean`

### success Constraints

**constant**: the value of this property must be equal to:

```json
true
```
